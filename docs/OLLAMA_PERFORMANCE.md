# Faster AI Concierge (Ollama)

Production path: **Cloudflare Worker** (`POST /api/v1/ai/chat`) → **Ollama** (`/api/chat`).  
There is no FastAPI sidecar; streaming is implemented on the Worker (and Nest for local Nest-only runs).

## What was slow

1. **No streaming** — the API waited for the full completion (`stream: false`) before the UI showed anything.
2. **Supabase seed/enrich on every API hit** — AI chat paid for unrelated DB round-trips before Ollama started.
3. **Large default model** — `llama3:latest` (~8B) is slower than a small chat model.
4. **Cold loads** — if the model unloaded between requests, the next reply waited for reload.
5. **Remote Ollama latency** — `OLLAMA_BASE_URL` pointing at a tunnel adds RTT on top of generation.

## What we changed

- **SSE streaming** from Worker/Nest → browser (`text/event-stream`); tokens render as they arrive.
- **Skip seed/media enrichment** for `/api/v1/ai/chat`.
- **Shorter system prompt** + last **8** history turns (was unbounded / 12).
- **Ollama options**: `keep_alive`, `num_predict`, `temperature` via Worker vars / `.env`.
- Default model var: **`llama3.2:3b`** (override anytime).

## Verify faster TTFT (time to first token)

1. Open DevTools → Network → send a chat message.
2. Select `POST .../api/v1/ai/chat`.
3. Confirm **Response Headers**: `content-type: text/event-stream`.
4. In the EventStream / preview pane, tokens should appear within ~1–3s (local) or a few seconds (remote), while the reply is still generating.
5. UI should replace “thinking…” with streaming text instead of waiting for the full answer.

Optional timing probe (local Ollama):

```bash
curl -N -X POST http://127.0.0.1:11434/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"llama3.2:3b\",\"stream\":true,\"keep_alive\":\"10m\",\"options\":{\"num_predict\":128},\"messages\":[{\"role\":\"user\",\"content\":\"Say hi in 5 words\"}]}"
```

## Ollama host settings (do this on the machine running Ollama)

```bash
# Pull a small, fast model (recommended for concierge chat)
ollama pull llama3.2:3b

# Optional: keep the process warm; set keep_alive via API (Worker already sends keep_alive)
# Forever in RAM (use when you have enough VRAM/RAM):
#   OLLAMA_KEEP_ALIVE=-1

# Windows (PowerShell) — persist env for the Ollama service user, then restart Ollama:
setx OLLAMA_KEEP_ALIVE "-1"
# Or for current session before starting `ollama serve`:
$env:OLLAMA_KEEP_ALIVE = "-1"
```

Also useful:

| Setting | Suggested | Why |
|--------|-----------|-----|
| Model | `llama3.2:3b` or `phi3:mini` | Much faster TTFT than `llama3:latest` |
| `OLLAMA_KEEP_ALIVE` | `10m` or `-1` | Avoid unload/cold start |
| `OLLAMA_NUM_PREDICT` | `256`–`384` | Cap long answers |
| `OLLAMA_TEMPERATURE` | `0.5`–`0.7` | Slightly lower = snappier / less rambling |
| Local URL | `http://127.0.0.1:11434` | Fastest; avoid remote tunnel when developing |

## Worker / env vars

`workers/api/wrangler.jsonc` `vars` (or secrets for URL):

```
OLLAMA_BASE_URL=https://ollama.cognaitive.in   # or http://127.0.0.1:11434 for local
OLLAMA_MODEL=llama3.2:3b
OLLAMA_KEEP_ALIVE=10m
OLLAMA_NUM_PREDICT=384
OLLAMA_TEMPERATURE=0.6
```

After changing vars:

```bash
cd workers/api
npx wrangler deploy
```

Ensure the Ollama host has pulled the same model name as `OLLAMA_MODEL`.

## API contract

- Default: **SSE** stream. Each event: `data: {"content":"..."}\n\n`, then `data: {"done":true}\n\n`.
- Non-stream JSON (legacy): POST body `{ "stream": false }` → `{ "response": "..." }`.
