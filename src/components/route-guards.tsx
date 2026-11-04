import OrganizerAccessDialog from "@/components/organizer-access-dialog";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth";
import type { TypeRoles } from "@/types/users";

// Where each role lands after login.
export const homePathFor = (role?: TypeRoles | null) =>
  role === "ORGANIZER" ? "/organizer" : "/";

// Only lets in logged-in users with the given role. Guests go to /login, other roles to their own home.
export function RequireRole({ role }: { role: TypeRoles }) {
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const userType = useAuthStore((s) => s.user?.userType);
  const location = useLocation();
  const navigate = useNavigate();

  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location }} />;
  if (userType !== role) {
    if (role === "ORGANIZER" && userType === "CUSTOMER") {
      return (
        <OrganizerAccessDialog
          open
          onOpenChange={(open) => {
            if (!open) navigate("/", { replace: true });
          }}
          onReturnHome={() => navigate("/", { replace: true })}
        />
      );
    }

    return <Navigate to={homePathFor(userType)} replace />;
  }
  return <Outlet />;
}

// Keeps logged-in users off /login and /register.
export function GuestOnly() {
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const userType = useAuthStore((s) => s.user?.userType);

  if (isLoggedIn) return <Navigate to={homePathFor(userType)} replace />;
  return <Outlet />;
}
