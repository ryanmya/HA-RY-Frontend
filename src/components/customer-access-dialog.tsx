import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isLoggedIn ? "Khusus akun customer" : "Masuk atau daftar sebagai customer"}
          </DialogTitle>
          <DialogDescription>
            Detail acara dan pembelian tiket hanya tersedia untuk customer yang sudah login.
            {isLoggedIn
              ? " Silakan gunakan akun customer untuk melanjutkan."
              : " Daftar sekarang untuk melihat detail acara dan membeli tiket."}
          </DialogDescription>
        </DialogHeader>
        {!isLoggedIn && (
          <DialogFooter>
            <NavLink
              to="/register"
              className={cn(buttonVariants(), "w-full sm:w-auto")}
            >
              Daftar sekarang
            </NavLink>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
