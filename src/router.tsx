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
import OrganizerDraftsPage from "./pages/organizer/OrganizerDraftsPage";
import OrganizerEventsEditorPage from "./pages/organizer/OrganizerEventsEditorPage";
import OrganizerEventsPage from "./pages/organizer/OrganizerEventsPage";
import OrganizerHomePage from "./pages/organizer/OrganizerHomePage";
import OrganizerProfilePage from "./pages/organizer/OrganizerProfilePage";
import OrganizerReviewsPage from "./pages/organizer/OrganizerReviewsPage";
import OrganizerTransactionsPage from "./pages/organizer/OrganizerTransactionsPage";
import OrganizerVouchersPage from "./pages/organizer/OrganizerVouchersPage";
import EventsDetailsPage from "./pages/events/EventsDetailsPage";
import CustomerProfilePage from "./pages/customer/CustomerProfilePage";

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
          { path: "/events-details/:id", Component: EventsDetailsPage },
          {
            path: "/profile",
            element: <RequireRole role="CUSTOMER" />,
            children: [{ index: true, Component: CustomerProfilePage }],
          },
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
              { path: "events/:id", Component: OrganizerEventsEditorPage },
              { path: "drafts", Component: OrganizerDraftsPage },
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
