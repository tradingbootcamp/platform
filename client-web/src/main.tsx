import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "@picocss/pico";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <ToastContainer />
  </StrictMode>
);
