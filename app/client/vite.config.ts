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
        "react",
        "react-dom"
      ]
    })
  ],
})
