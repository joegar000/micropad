import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { builtinModules } from 'module';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      // 1. Define multiple entry points
      entry: {
        client: resolve(__dirname, 'src/client/index.ts'),
        server: resolve(__dirname, 'src/server/index.ts'),
        shared: resolve(__dirname, 'src/shared/index.ts')
      },
      // Output formats (ES modules and CommonJS)
      formats: ['es', 'cjs'],
      // Standardizes filenames: dist/client.js, dist/server.cjs, etc.
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // 2. Mark your dependencies and Node built-ins as external
      external: [
        /node_modules/,             // Excludes all npm package dependencies
        ...builtinModules,          // Excludes node:fs, node:path, etc.
        ...builtinModules.map(m => `node:${m}`),
      ],
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
});

