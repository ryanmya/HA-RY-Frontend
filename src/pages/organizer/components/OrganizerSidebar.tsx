import Logo from "@/components/logo";
import { getOrganizerEventCount } from "@/lib/events";
import { cn } from "@/lib/utils";
import { useEventEditorStore } from "@/stores/event-editor";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { organizerNav } from "./organizer-nav";

export default function OrganizerSidebar() {
  const eventsVersion = useEventEditorStore((state) => state.eventsVersion);
  const [eventCountResult, setEventCountResult] = useState<{
    version: number;
    count?: number;
    error?: boolean;
  } | null>(null);

  useEffect(() => {
    let active = true;
    getOrganizerEventCount()
      .then((count) => {
        if (active) setEventCountResult({ version: eventsVersion, count });
      })
      .catch(() => {
        if (active) setEventCountResult({ version: eventsVersion, error: true });
      });

    return () => {
      active = false;
    };
  }, [eventsVersion]);

  const eventCountResultIsCurrent = eventCountResult?.version === eventsVersion;
  const eventCount = eventCountResultIsCurrent ? eventCountResult.count : undefined;
  const eventCountError = eventCountResultIsCurrent && eventCountResult.error;

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-6 border-r bg-card p-4">
      <div className="flex flex-col px-2">
        <Logo />
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Penyelenggara
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {organizerNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            // Without `end`, "/organizer" would stay active on every child page.
            end
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground hover:bg-accent",
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.label}
                {item.to === "/organizer/events" ? (
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-semibold",
                      isActive
                        ? "bg-white/20 text-primary-foreground"
                        : "bg-muted-subtle text-foreground",
                    )}
                    aria-label={
                      eventCountError
                        ? "Gagal memuat jumlah acara"
                        : eventCount === undefined
                          ? "Memuat jumlah acara"
                          : `${eventCount} acara`
                    }
                    title={
                      eventCountError
                        ? "Gagal memuat jumlah acara"
                        : eventCount === undefined
                          ? "Memuat jumlah acara"
                          : undefined
                    }
                  >
                    {eventCountError ? "!" : eventCount ?? "…"}
                  </span>
                ) : item.count !== undefined && (
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-semibold",
                      isActive
                        ? "bg-white/20 text-primary-foreground"
                        : item.countTone === "destructive"
                          ? "bg-destructive-subtle text-destructive"
                          : "bg-muted-subtle text-foreground",
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* TODO: load the next payout from the backend. */}
      <div className="flex flex-col gap-1 rounded-xl bg-primary-subtle/50 p-4">
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Pencairan berikutnya
        </span>
        <span className="text-lg font-extrabold">IDR 84,2 jt</span>
        <span className="text-xs text-muted-foreground">20 Sep 2026</span>
      </div>
    </aside>
  );
}
