import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppView from "../view/app";
import AppModel, { AppModelContext } from "../model/app.tsx";
import { io } from "socket.io-client";
import { ThemeProvider } from "micropad-ui";
import "micropad-ui/styles.css";
import "./index.css";

document.addEventListener("DOMContentLoaded", async () => {
  const socket = io({
    transports: ["websocket"],
  });

  const app = await AppModel.create(socket);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark">
        <AppModelContext value={app}>
          <AppView />
        </AppModelContext>
      </ThemeProvider>
    </StrictMode>,
  );
});
