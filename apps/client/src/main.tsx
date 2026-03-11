import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { layoutLoad } from './store/layout.tsx';
import { polyfill } from "mobile-drag-drop";

polyfill();

document.addEventListener('DOMContentLoaded', async () => {
  await layoutLoad;
  createRoot(document.getElementById('app')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
