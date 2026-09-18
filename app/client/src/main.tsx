import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppView from '../view/app';
import AppModel, { AppModelContext } from '../model/app.tsx';
import { io } from 'socket.io-client';

document.addEventListener('DOMContentLoaded', async () => {
  const socket = io({
    transports: ['websocket']
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppModelContext value={new AppModel({ socket })}>
        <AppView />
      </AppModelContext>
    </StrictMode>
  );
});
