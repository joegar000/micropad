import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        dts({
            entryRoot: 'src',
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'micropad-widgets',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'cjs' ? 'cjs' : 'es.js'}`,
        },
        rollupOptions: {
            external: ['socket.io', 'socket.io-client'],
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
