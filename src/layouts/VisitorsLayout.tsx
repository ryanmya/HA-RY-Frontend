import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useNavSlots } from "@/hooks/useNavSlots";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";

export default function VisitorsLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleNavigate = (to: string): void => {
    navigate(to);
  };

  const slots = useNavSlots({
    left: <div className="text-primary">HARY</div>,
    center: (
      <div className="flex gap-2">
        <NavLink to="/" className={buttonVariants({ variant: "ghost" })}>
          Home
        </NavLink>
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
        <Badge>12.500 pts</Badge>
        <Button variant={"outline"}>Sign In</Button>
        <Button variant={"default"}>Create Event</Button>
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
