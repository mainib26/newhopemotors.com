import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			'.prisma/client': './src/generated/prisma'
		}
	},
	ssr: {
		noExternal: ['@prisma/adapter-pg'],
		external: ['pg']
	}
});
