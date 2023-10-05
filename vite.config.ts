import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { purgeCss } from 'vite-plugin-tailwind-purgecss'

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	define: {
		APP_TESTING: process.env.APP_TESTING
	},
	test: {
		alias: [{ find: /^svelte$/, replacement: 'svelte/internal' }],
		environment: 'jsdom',
		dir: "./tests/components",
		// threads: false, // Necessary for canvas testing in BarChart component
		exclude: ["**/BarChart.test.ts", '**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*']
		// globals: true
	}
});

