# Lumikko UI

This is the frontend UI for the Lumikko project, built with [SvelteKit](https://kit.svelte.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), and deployed to [Cloudflare Pages](https://pages.cloudflare.com/).

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Yarn](https://yarnpkg.com/) (v1.x)

## Getting Started

Install dependencies:

```bash
yarn
```

### Environment Variables

The app expects the following environment variable to be set (for local development, you can use a `.env` file):

- `PUBLIC_API_URL` — The base URL of your backend API (e.g., `http://localhost:8787` or your deployed API endpoint).

This is used to connect to the backend for code sanitization and recommendations.

### Development

Start the development server:

```bash
yarn dev
```

This will launch the app locally with hot module reloading.

### Building for Production

To build the app for production:

```bash
yarn build
```

### Previewing the Production Build

To preview the production build locally (using Cloudflare Pages emulator):

```bash
yarn preview
```

### Type Checking

To check your code for type errors:

```bash
yarn check
```

Or to run type checking in watch mode:

```bash
yarn check:watch
```

### Cloudflare Integration

- **Type Generation:**  
  Generate Cloudflare Worker types:

  ```bash
  yarn cf-typegen
  ```

- **Deploy to Cloudflare Pages:**  
  Build and deploy to Cloudflare Pages:

  ```bash
  yarn deploy
  ```

## Main Features

- **Paste and Improve Code:** Users can paste code or scripts, which are then sent to the backend for sanitization and security improvements.
- **Recommendations:** The app displays further improvement recommendations, styled with Tailwind CSS and HTML.
- **Modern UI:** Responsive, accessible, and visually appealing design with custom neon effects.
- **Error Handling:** Clear error messages for API or network issues.

## Project Structure

- `src/routes/+page.svelte` — Main page UI and logic
- `src/routes/+layout.svelte` — Global layout and CSS import
- `src/lib/` — Place for shared utilities/components (via `$lib` alias)
- `src/app.html` — HTML template (includes favicon)
- `src/app.css` — Global styles (imports Tailwind CSS)
- `static/` — Static assets (e.g., `favicon.png`)
- `.svelte-kit/` — SvelteKit build output (auto-generated)
- `.wrangler/` — Cloudflare Wrangler state (auto-generated)

## Notes

- The project uses the `@sveltejs/adapter-cloudflare` for deployment.
- Tailwind CSS is integrated via the Vite plugin.
- The favicon is located in `static/favicon.png` and referenced in the HTML template.

## License & Attribution

- Made by [NeonTowel](https://github.com/NeonTowel) 🦄
- Dedicated to the public domain ([Unlicense](https://unlicense.org/))
- Powered by Private Azure OpenAI ⚡

---

For more information, see the [SvelteKit documentation](https://kit.svelte.dev/docs) and [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/).
