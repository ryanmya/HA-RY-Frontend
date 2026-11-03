import { Outlet, useLocation } from "react-router";

// Wraps every route. The key remounts the page on each navigation, so the enter animation replays.
export default function RootLayout() {
  const { pathname } = useLocation();

  return (
    <div
      key={pathname}
      className="flex min-h-screen flex-col animate-in fade-in duration-300 ease-out motion-reduce:animate-none"
    >
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-primary px-6 py-5 text-primary-foreground md:px-12">
        <div className="mx-auto max-w-7xl text-center text-sm font-medium">
          &copy; 2026 HA-RY Pass
        </div>
      </footer>
    </div>
  );
}
