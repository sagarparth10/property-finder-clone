# AI Concierge (Ollama agent)

Production path: **Cloudflare Worker** (`POST /api/v1/ai/chat`) → **`OLLAMA_AGENT_URL`** (`POST { prompt, images? }` → `{ answer }`).

Default agent URL: `https://ollama.cognaitive.in/agent`.

## Auth

The agent endpoint expects:

```
Authorization: Bearer <secret>
```

Set the Worker secret (paste when prompted — never commit the value):

```bash
cd workers/api
npx wrangler secret put OLLAMA_API_SECRET
```

GitHub Actions deploy only needs `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`. Worker secrets like `OLLAMA_API_SECRET` live in Cloudflare and persist across `wrangler deploy`; you do **not** put the secret in the workflow YAML.

Local Nest / Worker: put `OLLAMA_API_SECRET=...` in `backend/.env` or `workers/api/.dev.vars` (both gitignored).

**If a key was ever pasted in chat, rotate it** on the agent host and re-run `wrangler secret put OLLAMA_API_SECRET`.

## Request / response

Worker → agent:

```json
{
  "prompt": "…system + history + user message…",
  "images": ["base64…"]
}
```

`images` is omitted when the chat is text-only.

Agent → Worker:

```json
{ "answer": "…" }
```

Browser → Worker still uses `/api/v1/ai/chat` with `{ message, history?, language?, images?, stream? }`.  
The agent API is **JSON-only** (non-streaming). When `stream: true` (default), the Worker returns SSE with **one** `content` event containing the full `answer`, then `done`.

## Latency notes

1. Skip seed/media enrichment for `/api/v1/ai/chat`.
2. Last **8** history turns folded into `prompt`.
3. Up to **4** images (base64) from the chat UI paperclip control.

## Worker / env vars

`workers/api/wrangler.jsonc` `vars`:

```
OLLAMA_AGENT_URL=https://ollama.cognaitive.in/agent
```

Secrets (Wrangler):

```
OLLAMA_API_SECRET   # Bearer token — wrangler secret put
```

Optional legacy vars (`OLLAMA_MODEL`, `OLLAMA_KEEP_ALIVE`, …) are unused by the agent path.

After changing vars:

```bash
cd workers/api
npx wrangler deploy
```

## API contract (browser ↔ Worker)

- Default: **SSE**. Events: `data: {"content":"..."}\n\n`, then `data: {"done":true}\n\n` (content is typically one full answer).
- Non-stream JSON: POST body `{ "stream": false }` → `{ "response": "..." }`.
