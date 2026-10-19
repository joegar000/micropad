import path from "path";
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import { viteImportMaps } from 'vite-import-maps';

export default defineConfig({
  build: {
    sourcemap: true
  },
  plugins: [
    react(),
    tailwindcss(),
    viteImportMaps({
      imports: [
        "micropad-sdk/client",
        "mobx",
        "mobx-react-lite",
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-dom/client"
      ]
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, '..', '..', 'ui', 'src')
    }
  }
})
