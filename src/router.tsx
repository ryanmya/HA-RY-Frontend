import { createBrowserRouter } from "react-router";
import { GuestOnly, RequireRole } from "./components/route-guards";
import RootLayout from "./layouts/RootLayout";
import OrganizerLayout from "./layouts/OrganizerLayout";
import VisitorsLayout from "./layouts/VisitorsLayout";
import ComponentsPage from "./pages/ComponentsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OrganizerAttendeesPage from "./pages/organizer/OrganizerAttendeesPage";
import OrganizerEventsPage from "./pages/organizer/OrganizerEventsPage";
import OrganizerHomePage from "./pages/organizer/OrganizerHomePage";
import OrganizerProfilePage from "./pages/organizer/OrganizerProfilePage";
import OrganizerReviewsPage from "./pages/organizer/OrganizerReviewsPage";
import OrganizerTransactionsPage from "./pages/organizer/OrganizerTransactionsPage";
import OrganizerVouchersPage from "./pages/organizer/OrganizerVouchersPage";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        Component: GuestOnly,
        children: [
          { path: "/login", Component: LoginPage },
          { path: "/register", Component: RegisterPage },
        ],
      },
      {
        Component: VisitorsLayout,
        children: [
          { index: true, Component: HomePage },
          { path: "/components-page", Component: ComponentsPage },
        ],
      },
      {
        path: "/organizer",
        element: <RequireRole role="ORGANIZER" />,
        children: [
          {
            Component: OrganizerLayout,
            children: [
              { index: true, Component: OrganizerHomePage },
              { path: "events", Component: OrganizerEventsPage },
              { path: "transactions", Component: OrganizerTransactionsPage },
              { path: "attendees", Component: OrganizerAttendeesPage },
              { path: "vouchers", Component: OrganizerVouchersPage },
              { path: "reviews", Component: OrganizerReviewsPage },
              { path: "profile", Component: OrganizerProfilePage },
            ],
          },
        ],
      },
    ],
  },
]);
