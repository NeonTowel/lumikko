# Lumikko API

This is the backend API for the Lumikko project, built with [Hono](https://hono.dev/) and deployed as a [Cloudflare Worker](https://developers.cloudflare.com/workers/).

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Bun](https://bun.sh/)

## Getting Started

Install dependencies:

```bash
bun install
```

### Development

Start the local development server:

```bash
bun run  dev
```

This will run the Worker locally using Wrangler.

### Building & Deploying

To deploy to Cloudflare Workers:

```bash
bun run deploy
```

### Type Generation

To generate or synchronize types for your Worker bindings:

```bash
bun run cf-typegen
```

## API Endpoints

- `POST /api/generate` — Sanitize and anonymize code samples. Returns sanitized code or an error.
- `POST /api/generate_with_recommendations` — Sanitize code and return improvement recommendations (with Tailwind-styled HTML in the recommendations).

See `api/api-tests.http` for example requests.

## Environment Variables

Set these in your Cloudflare Worker environment (see `wrangler.toml`):

- `AZURE_OPENAI_ENDPOINT` — Azure OpenAI API endpoint
- `AZURE_OPENAI_API_KEY` — Your Azure OpenAI API key
- `CLOUDFLARE_AI_GATEWAY_API_KEY` — Cloudflare AI Gateway API key

Preferred way is to use Workers secrets for keys, and store API endpoint in `wrangler.toml`:

```bash
npx wrangler secret put AZURE_OPENAI_API_KEY
npx wrangler secret put CLOUDFLARE_AI_GATEWAY_API_KEY
```

## Project Structure

- `src/index.ts` — Main entry point (Hono app and endpoints)
- `public/` — Static assets (for local dev only)
- `api-tests.http` — Example HTTP requests for testing endpoints
- `wrangler.toml` — Cloudflare Worker configuration

## Notes

- The API uses CORS for `/api/*` endpoints (open by default; restrict in production).
- All code is TypeScript and type-checked with Cloudflare Worker types.

## License & Attribution

- Made by [NeonTowel](https://github.com/NeonTowel) 🦄
- Dedicated to the public domain ([Unlicense](https://unlicense.org/))
- Powered by Private Azure OpenAI ⚡

---

For more, see the [Hono documentation](https://hono.dev/) and [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/).
