import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		hmr: {
			overlay: false
		}
	},
	optimizeDeps: {
		exclude: ['@auth0/auth0-spa-js']
	}
});
