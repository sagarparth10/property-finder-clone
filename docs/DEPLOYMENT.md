# Deployment (Cloudflare)

Production site: **https://property.cognaitive.in**

The app is a Cloudflare Worker (`property-nexus-api`) that:

1. Serves the Next.js static export from `frontend/out`
2. Handles `/api/*` on the same origin

Vercel is **not** used for this project. Do not reconnect the GitHub repo to a Vercel project.

## Manual deploy

```bash
cd frontend
npm ci
npm run build

cd ../workers/api
npm ci
npx wrangler deploy
```

Requires Wrangler auth (`npx wrangler login`) or `CLOUDFLARE_API_TOKEN`.

## Auto-deploy (GitHub Actions)

Workflow: `.github/workflows/deploy-cloudflare.yml`

On every push to `main` it builds `frontend/` then runs `wrangler deploy` from `workers/api`.

### Required GitHub repository secrets

| Secret | Where to get it |
|--------|-----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token with **Edit Cloudflare Workers** |
| `CLOUDFLARE_ACCOUNT_ID` | `70bcc8850ec2a9653067d5cc78ad70cd` (or Cloudflare dashboard → Workers overview) |

Add them at:  
https://github.com/sagarparth10/property-finder-clone/settings/secrets/actions

Until both secrets exist, the Actions workflow will fail at the deploy step.

## Worker secrets (runtime)

Set separately with Wrangler (not in GitHub Actions unless you add them):

```bash
cd workers/api
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put JWT_SECRET
npx wrangler secret put OLLAMA_API_SECRET
# optional override (default is set in wrangler.jsonc vars):
# npx wrangler secret put OLLAMA_AGENT_URL
```

`OLLAMA_API_SECRET` is sent as `Authorization: Bearer …` to the agent. Paste when prompted; never commit the value. Rotate the key if it was shared in chat.

GitHub Actions only needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for deploy — Worker secrets persist in Cloudflare and are not re-uploaded by the workflow.

See `workers/api/.dev.vars.example` for local development and `docs/OLLAMA_PERFORMANCE.md` for the agent contract.