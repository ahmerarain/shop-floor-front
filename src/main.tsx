import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryProvider } from "./providers/QueryProvider";
import { Toaster } from "sonner";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
      <Toaster position="bottom-right" richColors />
    </QueryProvider>
  </React.StrictMode>
);
