import { useEffect, useState, type ReactNode } from "react";
import Logo from "@/components/logo";
import { refresh } from "@/lib/auth";
import { cn } from "@/lib/utils";

// The loader stays up at least this long, even if the refresh finishes sooner.
const MIN_LOADING_MS = 700;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Tries to restore the session once on app start, before rendering the app.
export default function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  
  useEffect(() => {
    Promise.allSettled([refresh(), wait(MIN_LOADING_MS)]).then(() => setReady(true));
  }, []);

  return (
    <>
      {/* The app mounts under the loader once ready, then the loader fades out over it. */}
      {ready && children}
      {!loaderGone && (
        <div
          className={cn(
            "fixed inset-0 z-1000 flex items-center justify-center bg-background transition-opacity duration-500 ease-out",
            ready && "pointer-events-none opacity-0",
          )}
          onTransitionEnd={() => setLoaderGone(true)}
        >
          <Logo loading />
        </div>
      )}
    </>
  );
}
