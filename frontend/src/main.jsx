import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // 👈 THIS WAS MISSING

// ── Screenshot Prevention ──
// Disable right-click context menu to prevent "Save as" on images
document.addEventListener("contextmenu", (e) => {
  // Allow right-click on input/textarea elements
  if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
  e.preventDefault();
});

// Disable common keyboard shortcuts used for screenshots / print
document.addEventListener("keydown", (e) => {
  // Block PrintScreen key
  if (e.key === "PrintScreen") {
    e.preventDefault();
  }
  // Block Ctrl+P (Print)
  if ((e.ctrlKey || e.metaKey) && e.key === "p") {
    e.preventDefault();
  }
  // Block Ctrl+S (Save)
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
