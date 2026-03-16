
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { layoutLoad } from './store/layout.tsx';
import { io } from "socket.io-client";
import { SocketProvider } from './socket.tsx';
import polyfill from './polyfill.tsx';

polyfill();

document.addEventListener('DOMContentLoaded', async () => {
  const socket = io();
  await layoutLoad;
  createRoot(document.getElementById('app')!).render(
    <StrictMode>
      <SocketProvider socket={socket}>
        <App />
      </SocketProvider>
    </StrictMode>
  );
});
