import React from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App";

const container = document.getElementById("root");
if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Error rendering app:", error);
    container.innerHTML = `<div style="padding: 20px; color: red;"><h1>Error</h1><pre>${error.message}</pre></div>`;
  }
} else {
  console.error("Root element not found!");
}
