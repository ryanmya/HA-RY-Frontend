import { Outlet, useLocation } from "react-router";

// Wraps every route. The key remounts the page on each navigation, so the enter animation replays.
export default function RootLayout() {
  const { pathname } = useLocation();
  const showFooter = pathname !== "/login";
  const isOrganizerPage = pathname.startsWith("/organizer");

  return (
    <div
      key={pathname}
      className="flex min-h-screen flex-col animate-in fade-in duration-300 ease-out motion-reduce:animate-none"
    >
      <main
        className={`flex min-h-0 flex-1 flex-col ${isOrganizerPage ? "pb-14" : ""}`}
      >
        <Outlet />
      </main>
      {showFooter && (
        <footer
          className={`flex h-14 shrink-0 items-center bg-primary px-6 text-primary-foreground md:px-12 ${
            isOrganizerPage ? "fixed inset-x-0 bottom-0 z-50" : ""
          }`}
        >
          <div className="mx-auto max-w-7xl text-center text-sm font-medium">
            &copy; 2026 HA-RY Pass
          </div>
        </footer>
      )}
    </div>
  );
}
