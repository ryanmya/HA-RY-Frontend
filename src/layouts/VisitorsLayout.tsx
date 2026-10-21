import Logo from "@/components/logo";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import { useNavSlots } from "@/hooks/useNavSlots";
import { useAuthStore } from "@/stores/auth";
import { NavLink, Outlet } from "react-router";

export default function VisitorsLayout() {
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const isOrganizer = useAuthStore((s) => s.user?.userType === "ORGANIZER");

  const slots = useNavSlots({
    left: <Logo />,
    center: (
      <div className="flex gap-2">
        <NavLink to="/" className={buttonVariants({ variant: "ghost" })}>
          Events
        </NavLink>
        {isLoggedIn && !isOrganizer && (
          <NavLink to="/my-orders" className={buttonVariants({ variant: "ghost" })}>
            My Orders
          </NavLink>
        )}
        <NavLink
          to="/components-page"
          className={buttonVariants({ variant: "ghost" })}
        >
          Components
        </NavLink>
      </div>
    ),
    right: (
      <div className="flex flex-row gap-2.5 items-center">
        {isLoggedIn ? (
          <>
            {isOrganizer ? (
              <NavLink to="/organizer" className={buttonVariants({ variant: "default" })}>
                Dashboard
              </NavLink>
            ) : (
              <Badge>12.500 pts</Badge>
            )}
            <UserMenu />
          </>
        ) : (
          <>
            <NavLink
              className={buttonVariants({ variant: "outline" })}
              to={"/login"}
            >
              Sign In
            </NavLink>
            <Button variant={"default"}>Create Event</Button>
          </>
        )}
      </div>
    ),
  });

  return (
    <div className="pb-6">
      <Navbar {...slots} />
      <Outlet />
    </div>
  );
}
