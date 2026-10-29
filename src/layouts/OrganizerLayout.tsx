import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import { useNavSlots } from "@/hooks/useNavSlots";
import OrganizerSidebar from "@/pages/organizer/components/OrganizerSidebar";
import { organizerNav } from "@/pages/organizer/components/organizer-nav";
import EventEditorDialog from "@/pages/organizer/components/EventEditorDialog";
import { useEventEditorStore } from "@/stores/event-editor";
import { Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/stores/auth";

export default function OrganizerLayout() {
  const { pathname } = useLocation();
  // The navbar title follows the active sidebar entry.
  const title = organizerNav.find((item) => item.to === pathname.replace(/\/$/, ""))?.label;
  const showUser = useAuthStore((s) => s.user)
  console.log(showUser);
  const openEditor = useEventEditorStore((s) => s.openEditor);
  const now = new Date();
  const today = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const dateTime = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const slots = useNavSlots({
    center: <div className="font-semibold">{title}</div>,
    right: (
      <div className="flex flex-row gap-4 items-center">
        <time dateTime={dateTime}>{today}</time>
        <Button onClick={() => openEditor()}>Buat Acara</Button>
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
      <EventEditorDialog />
    </div>
  );
}
