import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ShieldAlert } from "lucide-react";

type OrganizerAccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReturnHome: () => void;
};

export default function OrganizerAccessDialog({
  open,
  onOpenChange,
  onReturnHome,
}: OrganizerAccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden border-0 bg-white p-0 shadow-2xl sm:max-w-md">
        <div className="relative overflow-hidden bg-primary px-6 pb-7 pt-8 text-primary-foreground">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-16 size-48 rounded-full border-[24px] border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -right-2 size-36 rounded-full bg-white/5"
          />
          <div className="relative mb-5 flex size-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner">
            <ShieldAlert className="size-7" aria-hidden="true" />
          </div>
          <DialogHeader className="relative gap-2 text-left">
            <p className="text-xs font-bold tracking-[0.18em] text-white/75 uppercase">
              Batas akses akun
            </p>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              Halaman khusus organizer
            </DialogTitle>
            <DialogDescription className="max-w-sm text-sm leading-relaxed text-white/85">
              Akun customer tidak memiliki akses ke dashboard penyelenggara.
              Kembali ke beranda untuk melanjutkan menjelajahi acara.
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="flex-col items-center gap-3 bg-white p-5 sm:flex-col sm:justify-center">
          <Button
            variant="outline"
            className="w-fit border-primary bg-white px-5 text-primary hover:bg-primary-subtle"
            onClick={onReturnHome}
          >
            <ArrowLeft aria-hidden="true" />
            Kembali ke beranda
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Ingin menjadi penyelenggara? Buat akun organizer untuk mengakses fitur ini.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
