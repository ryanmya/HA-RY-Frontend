import Logo from "@/components/logo";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import { useNavSlots } from "@/hooks/useNavSlots";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { NavLink, Outlet } from "react-router";

type TypeMenu = {
  to: string;
  name: string;
  hide: boolean;
};

export default function VisitorsLayout() {
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const isOrganizer = useAuthStore((s) => s.user?.userType === "ORGANIZER");

  const navMenu: TypeMenu[] = [
    {
      to: "/",
      name: "Events",
      hide: false,
    },
    {
      to: "/my-orders",
      name: "",
      hide: !isLoggedIn || isOrganizer,
    },
    // {
    //   to: "",
    //   name: "",
    //   hide: false,
    // },
  ];

  const slots = useNavSlots({
    left: <Logo />,
    center: (
      <div className="flex gap-2">
        {navMenu.map((e) => (
          <NavLink to={e.to} className={cn(buttonVariants({ variant: "ghost" }), e.hide && "hidden")}>
            {e.name}
          </NavLink>
        ))}
      </div>
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
