import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const entryName = mode === "client" ? "client" : "server";

  return {
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    build: {
      emptyOutDir: entryName === "server",
      lib: {
        entry: {
          [entryName]: resolve(
            rootDir,
            `src/${entryName}.${entryName === "client" ? "tsx" : "ts"}`,
          ),
        },
        formats: ["es"],
        fileName: (format, name) => `${name}.${format === "es" ? "js" : "cjs"}`,
      },
      rolldownOptions: {
        output: { codeSplitting: false },
        external: [
          "micropad-sdk/server",
          "micropad-sdk/client",
          "react",
          "react-dom",
          "mobx",
          "mobx-react-lite",
          "node-nowplaying",
          "pulseaudio.js",
          "loudness",
        ],
      },
    },
  };
});
