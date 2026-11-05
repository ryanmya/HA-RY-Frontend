import Logo from "@/components/logo";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import { useNavSlots } from "@/hooks/useNavSlots";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { NavLink, Outlet } from "react-router";

const pointsFormatter = new Intl.NumberFormat("id-ID");

// Shown only to logged-in customers; the routes themselves are also guarded by RequireRole.
const customerLinks = [
  { to: "/", label: "Acara", end: true },
  { to: "/transactions", label: "Pesanan saya", end: false },
];

export default function VisitorsLayout() {
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isOrganizer = user?.userType === "ORGANIZER";
  const isCustomer = isLoggedIn && user?.userType === "CUSTOMER";

  const slots = useNavSlots({
    left: (
      <NavLink to="/" aria-label="HA-RY homepage" className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <Logo />
      </NavLink>
    ),
    center: isCustomer && (
      <div className="flex gap-1">
        {customerLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(buttonVariants({ variant: "ghost" }), isActive && "bg-primary-subtle text-primary")
            }
          >
            {link.label}
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
              <NavLink
                to="/points"
                aria-label="Lihat riwayat poin"
                className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Badge className="cursor-pointer">
                  {pointsFormatter.format(user?.point ?? 0)} pts
                </Badge>
              </NavLink>
            )}
            <UserMenu />
          </>
        ) : (
          <>
            <NavLink
              className={buttonVariants({ variant: "outline" })}
              to={"/login"}
            >
              Masuk
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
