import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'micropad-widgets',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'cjs' ? 'cjs' : 'es.js'}`,
        },
        rollupOptions: {
            external: ['socket.io', 'socket.io-client', 'micropad-protocol'],
            output: [
                {
                    format: 'es',
                    entryFileNames: 'index.es.js',
                    exports: 'named',
                },
                {
                    format: 'cjs',
                    entryFileNames: 'index.cjs',
                    exports: 'named',
                },
            ],
        },
        sourcemap: true,
        minify: false,
    },
});
