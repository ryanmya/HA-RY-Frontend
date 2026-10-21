// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./router";
import AuthGate from "./components/auth-gate";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>

  // </StrictMode>
  <AuthGate>
    <RouterProvider router={router} />
  </AuthGate>,
);
