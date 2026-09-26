import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';
import { builtinModules } from 'node:module';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      // 1. Define multiple entry points
      entry: {
        client: resolve(import.meta.dirname, 'src/client/index.ts'),
        server: resolve(import.meta.dirname, 'src/server/index.ts'),
        shared: resolve(import.meta.dirname, 'src/shared/index.ts')
      },
      // Output formats (ES modules and CommonJS)
      formats: ['es', 'cjs'],
      // Standardizes filenames: dist/client.js, dist/server.cjs, etc.
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rolldownOptions: {
      // MobX is supplied by the host import map. Node built-ins must remain
      // external for the server entry. Other SDK dependencies are bundled so
      // the browser entry never contains machine-specific node_modules paths.
      external: [
        'mobx',
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

