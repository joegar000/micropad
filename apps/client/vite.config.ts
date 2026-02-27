import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import flowbiteReact from "flowbite-react/plugin/vite";

export default defineConfig({
  plugins: [react(), VitePWA(), tailwindcss(), flowbiteReact()],
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
    watch: {
      usePolling: true
    },
    proxy: {
      "/api": "http://localhost:3000",
      "/ws": {
        target: "ws://localhost:3000",
        ws: true,
      },
    },
  },
});