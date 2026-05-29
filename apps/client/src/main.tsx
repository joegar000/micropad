import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SocketProvider } from './socket.tsx';
import applyBrowserPolyfills from './browser-polyfills';
import { io } from 'socket.io-client';

applyBrowserPolyfills();

document.addEventListener('DOMContentLoaded', async () => {
  createRoot(document.getElementById('app')!).render(
    <StrictMode>
      <SocketProvider socket={io({ autoConnect: false })}>
        <App />
      </SocketProvider>
    </StrictMode>
  );
});
