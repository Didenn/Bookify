import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    server: {
        host: '0.0.0.0', 
        port: 5173,
        strictPort: true,
        // Let Vite infer HMR host from the browser origin.
        // Hardcoding localhost breaks updates when using LAN/IP URLs.
        hmr: true,
        cors: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
});