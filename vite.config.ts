import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: 'client',
    publicDir: '../public',
    build: {
        outDir: '../dist/client',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                login: resolve(__dirname, 'client/login.html'),
                rooms: resolve(__dirname, 'client/rooms.html'),
                game: resolve(__dirname, 'client/game.html')
            }
        }
    },
    server: {
        port: 5173,
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3333',
                ws: true
            }
        }
    }
});
