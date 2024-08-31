import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "@picocss/pico";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
