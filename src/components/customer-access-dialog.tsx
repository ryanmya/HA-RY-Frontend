import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowRight, LockKeyhole, TicketCheck } from "lucide-react";
import { NavLink } from "react-router";

type CustomerAccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoggedIn: boolean;
};

export default function CustomerAccessDialog({
  open,
  onOpenChange,
  isLoggedIn,
}: CustomerAccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden border-white bg-white p-0 sm:max-w-md">
        <div className="bg-primary px-5 py-5 text-primary-foreground">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-white bg-white/15">
            {isLoggedIn ? (
              <LockKeyhole className="size-5" aria-hidden="true" />
            ) : (
              <TicketCheck className="size-5" aria-hidden="true" />
            )}
          </div>
          <DialogHeader className="gap-2 text-left">
            <DialogTitle className="text-lg font-bold text-white">
              {isLoggedIn
                ? "Khusus akun customer"
                : "Temukan acara favoritmu"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-white/85">
              {isLoggedIn
                ? "Detail acara dan pembelian tiket hanya tersedia untuk akun customer."
                : "Daftar sebagai customer untuk melihat detail acara dan mendapatkan tiket."}
            </DialogDescription>
          </DialogHeader>
        </div>
        {!isLoggedIn && (
          <DialogFooter className="flex-col items-center gap-2 bg-white p-4 sm:flex-col sm:justify-center">
            <NavLink
              to="/register"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-fit justify-center rounded-lg border-primary bg-white px-4 text-primary hover:bg-primary-subtle",
              )}
            >
              Daftar sebagai customer
              <ArrowRight className="size-4" aria-hidden="true" />
            </NavLink>
            <p className="py-2 text-center text-xs text-muted-foreground">
              Sudah punya akun?{" "}
              <NavLink
                to="/login"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Masuk
              </NavLink>
            </p>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}