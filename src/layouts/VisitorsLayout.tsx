import Logo from "@/components/logo";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import { useNavSlots } from "@/hooks/useNavSlots";
import { useAuthStore } from "@/stores/auth";
import { NavLink, Outlet } from "react-router";

export default function VisitorsLayout() {
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const isOrganizer = useAuthStore((s) => s.user?.userType === "ORGANIZER");

  const slots = useNavSlots({
    left: (
      <NavLink to="/" aria-label="HA-RY homepage" className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <Logo />
      </NavLink>
    ),
    right: (
      <div className="flex flex-row gap-2.5 items-center">
        {isLoggedIn ? (
          <>
            {isOrganizer ? (
              <NavLink
                to="/organizer"
                className={buttonVariants({ variant: "default" })}
              >
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
            <NavLink
              to="/register"
              state={{ createEventSignup: true }}
              className={buttonVariants({ variant: "default" })}
            >
              Create Event
            </NavLink>
          </>
        )}
      </div>
    ),
  });

  return (
    <div>
      <Navbar {...slots} />
      <Outlet />
    </div>
  );
}
