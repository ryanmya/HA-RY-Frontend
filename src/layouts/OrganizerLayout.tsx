import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import { useNavSlots } from "@/hooks/useNavSlots";
import OrganizerSidebar from "@/pages/organizer/components/OrganizerSidebar";
import { organizerNav } from "@/pages/organizer/components/organizer-nav";
import { Outlet, useLocation } from "react-router";

export default function OrganizerLayout() {
  const { pathname } = useLocation();
  // The navbar title follows the active sidebar entry.
  const title = organizerNav.find((item) => item.to === pathname.replace(/\/$/, ""))?.label;

  const slots = useNavSlots({
    center: <div className="font-semibold">{title}</div>,
    right: (
      <div className="flex flex-row gap-4 items-center">
        <div className="flex gap-2">
          <div>hari</div>
          <div>bulan</div>
          <div>tahun</div>
        </div>
        <Button>Buat Acara</Button>
        <UserMenu />
      </div>
    ),
  });

  return (
    <div className="flex min-h-screen">
      <OrganizerSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar {...slots} />
        <Outlet />
      </div>
    </div>
  );
}
