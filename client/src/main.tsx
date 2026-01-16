import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress harmless Chrome extension messaging errors
if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.onMessage.addListener(() => false);
}

// Global error handler
window.addEventListener("error", (event) => {
  console.error("❌ [Global Error]", event.error);
});

// ---- 🔥 THIS WAS MISSING 🔥 ----
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("❌ Root element not found. Check index.html");
}

createRoot(rootElement).render(
  <App />
);


