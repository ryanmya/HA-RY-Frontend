// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from "react-router";
import VisitorsLayout from "./layouts/VisitorsLayout";
import ComponentsPage from "./pages/ComponentsPage";
import HomePage from "./pages/HomePage";

const router = createBrowserRouter([
  {
    Component: VisitorsLayout,
    children: [
      {index: true, Component: HomePage},
      {path: '/components-page', Component: ComponentsPage}
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  // <StrictMode>

  // </StrictMode>
  <RouterProvider router={router} />,
);
