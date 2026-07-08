import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import "./styles/globals.css";
import { applyColorTheme, useSettingsStore } from "./stores/settings-store";

// Apply the persisted color theme before first paint to avoid a flash.
applyColorTheme(useSettingsStore.getState().colorTheme);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
