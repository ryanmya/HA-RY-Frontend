import { Outlet, useLocation } from "react-router";

// Wraps every route. The key remounts the page on each navigation, so the enter animation replays.
export default function RootLayout() {
  const { pathname } = useLocation();

  return (
    <div
      key={pathname}
      className="animate-in fade-in duration-300 ease-out motion-reduce:animate-none"
    >
      <Outlet />
    </div>
  );
}
