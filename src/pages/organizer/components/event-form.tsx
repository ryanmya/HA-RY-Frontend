import { TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { createVoucher } from "@/lib/vouchers";
import type { Voucher, VoucherInput } from "@/types/event";
import { ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Shared building blocks for the create-event dialog and the edit-event page.

export const MAX_EVENT_IMAGE_SIZE = 1024 * 1024;

// Large banner-style image picker. Shows the picked file, else `currentUrl`, else a placeholder.
// Files over 1 MB are rejected and never reach `onChange`.
export function ImagePicker({
  file,
  currentUrl,
  onChange,
}: {
  file: File | null;
  currentUrl?: string | null;
  onChange: (file: File | null) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const src = preview ?? currentUrl ?? null;

  return (
    <div className="flex flex-col gap-2">
      <label
        className={cn(
          "group relative flex aspect-21/9 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-field transition-colors hover:border-primary",
          error && "border-destructive",
        )}
      >
        {src ? (
          <>
            <img src={src} alt="Gambar acara" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              Ganti gambar
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="size-10" />
            <span className="text-sm font-semibold">Klik untuk unggah gambar acara</span>
            <span className="text-xs">Format gambar, maksimal 1 MB</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const picked = e.currentTarget.files?.[0] ?? null;
            e.currentTarget.value = "";
            if (!picked) return;
            if (picked.size > MAX_EVENT_IMAGE_SIZE) {
              setError("Ukuran gambar maksimal 1 MB.");
              return;
            }
            setError(null);
            onChange(picked);
          }}
        />
      </label>
      {error && <span className="text-xs text-destructive">{error}</span>}
      {file && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => onChange(null)}>
          Hapus gambar
        </Button>
      )}
    </div>
  );
}

// Two-option pill switch, e.g. Berbayar / Gratis.
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex rounded-full bg-muted-subtle/60 p-1", disabled && "opacity-60")}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full px-3 py-1 text-sm transition-colors",
            value === o.value ? "bg-white font-semibold text-primary shadow-sm" : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-card p-6 ring-1 ring-foreground/5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const emptyVoucher = (): VoucherInput => ({
  code: "",
  discountAmount: 0,
  startDate: "",
  endDate: "",
});

const formatIdr = (n: number) => n.toLocaleString("id-ID");

// Voucher form plus the event's vouchers. `initialVouchers` comes from GET /events/:id.
export function VoucherPanel({ eventId, initialVouchers = [] }: { eventId: string; initialVouchers?: Voucher[] }) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [voucher, setVoucher] = useState<VoucherInput>(emptyVoucher);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalid =
    voucher.code.trim().length < 3 ||
    voucher.discountAmount <= 0 ||
    !voucher.startDate ||
    !voucher.endDate ||
    voucher.endDate < voucher.startDate;

  const addVoucher = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const created = await createVoucher(eventId, voucher);
      setVouchers((v) => [created, ...v]);
      setVoucher(emptyVoucher());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menambah voucher. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Section title="Promo voucher">
        <p className="-mt-2 text-xs text-muted-foreground">
          Voucher penyelenggara hanya berlaku di acara Anda. Kupon sistem dari referral berlaku di semua acara dan
          tidak dikelola di sini.
        </p>
        <TextField
          label="Kode"
          placeholder="Huruf dan angka, 3–20 karakter"
          maxLength={20}
          value={voucher.code}
          // The backend only accepts uppercase letters and numbers.
          onChange={(e) => setVoucher({ ...voucher, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
        />
        <TextField
          label="Diskon"
          hint="IDR"
          type="number"
          min={1}
          value={voucher.discountAmount || ""}
          onChange={(e) => setVoucher({ ...voucher, discountAmount: Number(e.target.value) })}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Mulai"
            type="date"
            value={voucher.startDate}
            onChange={(e) => setVoucher({ ...voucher, startDate: e.target.value })}
          />
          <TextField
            label="Berakhir"
            type="date"
            min={voucher.startDate || undefined}
            aria-invalid={!!voucher.endDate && voucher.endDate < voucher.startDate}
            value={voucher.endDate}
            onChange={(e) => setVoucher({ ...voucher, endDate: e.target.value })}
          />
        </div>
        {error && (
          <Badge variant="destructive" size="lg">
            <span>{error}</span>
          </Badge>
        )}
        <Button onClick={addVoucher} disabled={invalid || submitting}>
          {submitting ? "Menambahkan…" : "Tambah voucher"}
        </Button>
      </Section>

      {vouchers.length > 0 && (
        <Section title="Aktif di acara ini">
          {vouchers.map((v) => (
            <div key={v.id} className="flex flex-col gap-1 rounded-xl bg-primary-subtle/30 p-4 ring-1 ring-primary/20">
              <span className="font-bold">{v.code}</span>
              <span className="text-xs text-muted-foreground">
                IDR {formatIdr(Number(v.discountAmount))} · {v.startDate.slice(0, 10)} → {v.endDate.slice(0, 10)}
              </span>
            </div>
          ))}
        </Section>
      )}
    </>
  );
}
