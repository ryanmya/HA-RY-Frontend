import { Popover } from "@base-ui/react/popover";
import { LogOutIcon, PencilLine, UserIcon } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

export default function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const isCustomer = user?.userType === "CUSTOMER";
  const navigate = useNavigate();
  const profilePicture = user?.profilePicture;

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label="Akun"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon-lg" }),
          "overflow-hidden rounded-full p-0",
        )}
      >
        {profilePicture ? (
          <img
            src={profilePicture}
            alt=""
            className="size-full rounded-full object-cover"
            decoding="async"
          />
        ) : (
          <UserIcon />
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} className="z-200">
          <Popover.Popup className="w-64 rounded-xl border bg-popover p-2 text-popover-foreground shadow-md outline-none">
            <div className="px-2 py-1.5">
              <div className="truncate font-semibold">{user?.name ?? "Pengguna"}</div>
              {user?.email && (
                <div className="truncate text-sm text-muted-foreground">{user.email}</div>
              )}
            </div>
            <div className="my-1 h-px bg-border" />
            {isCustomer && (
              <NavLink
                to="/profile"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start",
                )}
              >
                <PencilLine />
                Edit profil
              </NavLink>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOutIcon />
              Keluar
            </Button>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
