import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppView from '../view/app.tsx';
import AppModel from './model/app.tsx';
import { io } from 'socket.io-client';

document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppModelContext value={new AppModel({ socket })}>
        <AppView />
      </AppModelContext>
    </StrictMode>
  );
});
