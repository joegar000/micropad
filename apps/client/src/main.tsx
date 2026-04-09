import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SocketProvider } from './socket.tsx';
import polyfill from './polyfill.tsx';
import { io } from 'socket.io-client';

polyfill();

document.addEventListener('DOMContentLoaded', async () => {
  createRoot(document.getElementById('app')!).render(
    <StrictMode>
      <SocketProvider socket={io()}>
        <App />
      </SocketProvider>
    </StrictMode>
  );
});
