import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: {
        server: resolve(rootDir, "src/server.ts"),
        client: resolve(rootDir, "src/client.ts")
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rolldownOptions: {
      external: [
        "micropad-sdk/server",
        "micropad-sdk/client",
        "loudness",
        "mobx",
      ],
    },
  },
});
