import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const useSelfDestroyingServiceWorker = process.env.MICROPAD_CLIENT_SELF_DESTROYING_SW === "1";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      selfDestroying: useSelfDestroyingServiceWorker,
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/^\/socket\.io\//],
      },
    }),
    tailwindcss()
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
      sourcemap: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: '0.0.0.0',
    watch: {
      usePolling: true
    },
    proxy: {
      "/api": "http://localhost:3000",
      "/ws": {
        target: "ws://localhost:3000",
        ws: true,
      },
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});
