import QuantityStepper from "@/components/quantity-stepper";
import ReviewDialog from "@/components/review-dialog";
import StepBreadcrumb, { type Step } from "@/components/step-bread-crumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import { getMyCoupons, type Coupon } from "@/lib/coupons";
import { getCustomerPoints } from "@/lib/customer-points";
import { getEventById } from "@/lib/events";
import {
  cancelTransaction,
  getMyTransaction,
  updateCart,
  uploadPaymentProof,
} from "@/lib/transactions";
import { cn, formatCurrency } from "@/lib/utils";
import type { Voucher } from "@/types/event";
import { statusLabel, statusVariant } from "@/lib/transaction-status";
import type { CartInput, TransactionDetail, TransactionStatus } from "@/types/transaction";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router";

const MAX_PROOF_SIZE = 5 * 1024 * 1024;

const errorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.";

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const cartFrom = (t: TransactionDetail): CartInput => ({
  quantity: t.quantity,
  voucherId: t.voucherId,
  couponId: t.couponId,
  usePoints: Number(t.pointsUsed) > 0,
});

// Compares carts so we only PATCH when something actually changed.
const cartKey = (c: CartInput) => JSON.stringify([c.quantity, c.voucherId, c.couponId, c.usePoints]);

function stepsFor(status: TransactionStatus): Step[] {
  const failed = status === "REJECTED" || status === "CANCELED" || status === "EXPIRED";
  const order: TransactionStatus[] = ["WAITING_PAYMENT", "WAITING_CONFIRMATION", "DONE"];
  const at = failed ? -1 : order.indexOf(status);
  return [
    { label: "Pembayaran", variant: at > 0 ? "done" : at === 0 ? "active" : "fail" },
    { label: "Konfirmasi", variant: at > 1 ? "done" : at === 1 ? "active" : failed ? "fail" : "idle" },
    { label: failed ? statusLabel[status] : "Selesai", variant: at === 2 ? "done" : failed ? "fail" : "idle" },
  ];
}

// Ticks every second, for the payment countdown.
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function Countdown({ until }: { until: string }) {
  const now = useNow();
  const left = Math.max(0, new Date(until).getTime() - now);
  const mm = String(Math.floor(left / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  return (
    <Badge variant={left > 0 ? "warning" : "destructive"} size="lg" className="items-center justify-between">
      <span>{left > 0 ? "Selesaikan pembayaran dalam" : "Waktu pembayaran habis"}</span>
      <span className="type-price tabular-nums">
        {mm}:{ss}
      </span>
    </Badge>
  );
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const now = useNow();

  const [tx, setTx] = useState<TransactionDetail | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  // Usable coupons, plus the one already on this cart (the server leaves that one out of GET /coupons).
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  // Usable points plus any already held by this cart, so the amount stays right while they're applied.
  const [pointsAvailable, setPointsAvailable] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // The cart as the customer edits it, and the last cart the server accepted.
  const [cart, setCart] = useState<CartInput | null>(null);
  const [savedKey, setSavedKey] = useState("");
  const [cartError, setCartError] = useState<string | null>(null);

  const [proof, setProof] = useState<File | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const applyServer = (next: TransactionDetail) => {
    setTx(next);
    const fresh = cartFrom(next);
    setCart(fresh);
    setSavedKey(cartKey(fresh));
  };

  useEffect(() => {
    if (!id) return;
    getMyTransaction(id)
      .then((t) => {
        applyServer(t);
        // The transaction's event may not carry vouchers, so read them from the event itself.
        getEventById(t.eventId)
          .then((e) => setVouchers(e.vouchers ?? []))
          .catch(() => {});
        if (t.status !== "WAITING_PAYMENT") return;
        getMyCoupons()
          .then((list) => setCoupons(t.coupon ? [t.coupon, ...list.filter((c) => c.id !== t.coupon?.id)] : list))
          .catch(() => {});
        getCustomerPoints({ limit: 1 })
          .then((res) => setPointsAvailable(res.pagination.pointBalance + Number(t.pointsUsed)))
          .catch(() => {});
      })
      .catch((err) => setLoadError(errorMessage(err)));
  }, [id]);

  // Quantity clicks are debounced, so a burst of clicks sends one request.
  const debouncedCart = useDebounce(cart, 400);
  useEffect(() => {
    if (!tx || !debouncedCart || cartKey(debouncedCart) === savedKey) return;
    let active = true;
    updateCart(tx.id, debouncedCart)
      .then((updated) => {
        if (!active) return;
        setCartError(null);
        // PATCH returns the bare transaction; keep the relations we already loaded.
        // `cart` is left alone, so clicks made while this request ran aren't overwritten.
        setTx({
          ...tx,
          ...updated,
          voucher: vouchers.find((v) => v.id === updated.voucherId) ?? null,
          coupon: coupons.find((c) => c.id === updated.couponId) ?? null,
        });
        setSavedKey(cartKey(debouncedCart));
      })
      .catch((err) => {
        if (!active) return;
        setCartError(errorMessage(err));
        // Snap back to what the server last accepted.
        const fallback = cartFrom(tx);
        setCart(fallback);
        setSavedKey(cartKey(fallback));
      });
    return () => {
      active = false;
    };
  }, [debouncedCart, savedKey, tx, vouchers, coupons]);

  // The server expires unpaid carts (every minute) and cancels unanswered ones (every 10 minutes).
  // Once a deadline passes, poll until the new status shows up.
  const deadline =
    tx?.status === "WAITING_PAYMENT"
      ? tx.expiresAt
      : tx?.status === "WAITING_CONFIRMATION"
        ? tx.confirmationDeadline
        : null;
  const deadlinePassed = deadline !== null && new Date(deadline).getTime() <= now;
  useEffect(() => {
    if (!id || !deadlinePassed) return;
    const timer = setInterval(() => {
      getMyTransaction(id)
        .then((t) => {
          if (t.status !== tx?.status) applyServer(t);
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, [id, deadlinePassed, tx?.status]);

  if (loadError) return <div className="p-8 text-center text-destructive">{loadError}</div>;
  if (!tx || !cart) return <div className="p-8 text-center text-muted-foreground">Memuat transaksi…</div>;

  const syncing = cartKey(cart) !== savedKey;
  const expired = new Date(tx.expiresAt).getTime() <= now;
  const editable = tx.status === "WAITING_PAYMENT" && !expired;
  const cancellable = tx.status === "WAITING_PAYMENT" || tx.status === "WAITING_CONFIRMATION";
  const price = Number(tx.ticketType.price);
  // The backend allows reviews once the event has started.
  const canReview = tx.status === "DONE" && !tx.hasReviewed && new Date(tx.event.startDate).getTime() <= now;
  // The event returns every voucher, and the server doesn't check startDate, so filter here.
  const usableVouchers = vouchers.filter(
    (v) =>
      v.status === "AVAILABLE" && new Date(v.startDate).getTime() <= now && new Date(v.endDate).getTime() > now,
  );

  const handleUpload = async () => {
    if (!proof) return;
    setProofError(null);
    setUploading(true);
    try {
      const updated = await uploadPaymentProof(tx.id, proof);
      applyServer({ ...tx, ...updated });
      setProof(null);
    } catch (err) {
      setProofError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = async () => {
    setActionError(null);
    setCanceling(true);
    try {
      const updated = await cancelTransaction(tx.id);
      applyServer({ ...tx, ...updated });
      setConfirmCancel(false);
    } catch (err) {
      setActionError(errorMessage(err));
      setConfirmCancel(false);
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <NavLink to="/transactions" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Pesanan saya
      </NavLink>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="type-page-title">{tx.event.name}</h1>
          <span className="text-sm text-muted-foreground">Dipesan {formatDateTime(tx.createdAt)}</span>
        </div>
        <Badge variant={statusVariant[tx.status]}>{statusLabel[tx.status]}</Badge>
      </div>

      <StepBreadcrumb steps={stepsFor(tx.status)} layout="bar" />

      {actionError && (
        <Badge variant="destructive" size="lg">
          <span>{actionError}</span>
        </Badge>
      )}

      <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
        <div className="flex flex-col gap-6">
          {tx.status === "WAITING_PAYMENT" && <Countdown until={tx.expiresAt} />}

          <Card>
            <CardHeader>
              <CardTitle>Keranjang</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="font-semibold">{tx.ticketType.name}</span>
                  <span className="text-sm text-muted-foreground">{formatCurrency(price, "IDR")} / tiket</span>
                </div>
                {editable ? (
                  <QuantityStepper
                    value={cart.quantity}
                    min={1}
                    max={10}
                    onChange={(quantity) => setCart({ ...cart, quantity })}
                  />
                ) : (
                  <span className="font-semibold">× {tx.quantity}</span>
                )}
              </div>

              {editable && (
                <div className="flex flex-col gap-2">
                  <span className="type-label text-muted-foreground">Voucher acara</span>
                  {usableVouchers.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Tidak ada voucher untuk acara ini.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {usableVouchers.map((v) => {
                        const selected = cart.voucherId === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setCart({ ...cart, voucherId: selected ? null : v.id })}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                              selected ? "border-primary bg-primary-subtle text-primary" : "bg-field hover:border-primary",
                            )}
                          >
                            <div className="font-semibold">{v.code}</div>
                            <div className="text-xs">−{formatCurrency(Number(v.discountAmount), "IDR")}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {editable && (
                <div className="flex flex-col gap-2">
                  <span className="type-label text-muted-foreground">Kupon saya</span>
                  {coupons.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Anda belum punya kupon.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {coupons.map((c) => {
                        const selected = cart.couponId === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCart({ ...cart, couponId: selected ? null : c.id })}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                              selected ? "border-primary bg-primary-subtle text-primary" : "bg-field hover:border-primary",
                            )}
                          >
                            <div className="font-semibold">−{formatCurrency(Number(c.discountAmount), "IDR")}</div>
                            <div className="text-xs">Berlaku s/d {formatDateTime(c.expiresAt)}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {editable && (pointsAvailable > 0 || cart.usePoints) && (
                <Checkbox
                  label={`Gunakan poin saya (${formatCurrency(pointsAvailable, "IDR")})`}
                  checked={cart.usePoints}
                  onCheckedChange={(usePoints) => setCart({ ...cart, usePoints })}
                />
              )}

              {cartError && (
                <Badge variant="destructive" size="lg">
                  <span>{cartError}</span>
                </Badge>
              )}
            </CardContent>
          </Card>

          {tx.status === "WAITING_PAYMENT" && (
            <Card>
              <CardHeader>
                <CardTitle>Bukti pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  disabled={!editable}
                  className="rounded-xl border border-border bg-field px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0] ?? null;
                    if (file && file.size > MAX_PROOF_SIZE) {
                      e.currentTarget.value = "";
                      setProof(null);
                      setProofError("Ukuran file maksimal 5 MB.");
                      return;
                    }
                    setProofError(null);
                    setProof(file);
                  }}
                />
                <span className="text-xs text-muted-foreground">JPG, PNG, GIF atau WEBP, maksimal 5 MB.</span>
                {proofError && <span className="text-xs text-destructive">{proofError}</span>}
                <Button onClick={handleUpload} disabled={!proof || !editable || uploading || syncing}>
                  {uploading ? "Mengunggah…" : "Kirim bukti pembayaran"}
                </Button>
              </CardContent>
            </Card>
          )}

          {tx.status === "WAITING_CONFIRMATION" && (
            <Card>
              <CardHeader>
                <CardTitle>Menunggu konfirmasi penyelenggara</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                {tx.confirmationDeadline && (
                  <span>Penyelenggara akan merespons sebelum {formatDateTime(tx.confirmationDeadline)}.</span>
                )}
                {tx.paymentProofUrl && (
                  <img src={tx.paymentProofUrl} alt="Bukti pembayaran" className="max-h-80 rounded-xl object-contain" />
                )}
              </CardContent>
            </Card>
          )}

          {tx.status === "DONE" && (
            <Badge variant="success" size="lg">
              <span>Pembayaran disetujui. Tiket Anda sudah aktif — sampai jumpa di acara!</span>
            </Badge>
          )}
          {canReview && (
            <Card>
              <CardContent className="flex items-center justify-between gap-4">
                <span className="text-sm">Bagaimana pengalaman Anda di acara ini?</span>
                <Button onClick={() => setReviewOpen(true)}>Tulis ulasan</Button>
              </CardContent>
            </Card>
          )}
          {tx.status === "DONE" && tx.hasReviewed && (
            <span className="text-sm text-muted-foreground">Terima kasih, ulasan Anda sudah terkirim.</span>
          )}
          <ReviewDialog
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            eventId={tx.eventId}
            eventName={tx.event.name}
            onReviewed={() => setTx({ ...tx, hasReviewed: true })}
          />
          {tx.status === "REJECTED" && (
            <Badge variant="destructive" size="lg">
              <span>Pembayaran ditolak. Kursi, kupon dan poin Anda sudah dikembalikan.</span>
            </Badge>
          )}
          {(tx.status === "CANCELED" || tx.status === "EXPIRED") && (
            <Badge variant="muted" size="lg">
              <span>Pesanan ditutup.</span>
            </Badge>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(price * tx.quantity, "IDR")}</span>
            </div>
            {tx.voucher && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voucher {tx.voucher.code}</span>
                <span>−{formatCurrency(Number(tx.voucher.discountAmount), "IDR")}</span>
              </div>
            )}
            {tx.coupon && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kupon</span>
                <span>−{formatCurrency(Number(tx.coupon.discountAmount), "IDR")}</span>
              </div>
            )}
            {Number(tx.pointsUsed) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Poin</span>
                <span>−{formatCurrency(Number(tx.pointsUsed), "IDR")}</span>
              </div>
            )}
            <div className="my-1 h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              {/* Always the server's number; it recalculates every discount. */}
              <span className={cn("type-price", syncing && "opacity-50")}>
                {formatCurrency(Number(tx.totalPrice), "IDR")}
              </span>
            </div>
            {syncing && <span className="text-xs text-muted-foreground">Memperbarui harga…</span>}
            {cancellable && (
              <Button variant="destructive_outline" className="mt-2" onClick={() => setConfirmCancel(true)}>
                Batalkan pesanan
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan pesanan?</DialogTitle>
            <DialogDescription>
              Kursi, kupon dan poin akan dikembalikan. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
              Kembali
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={canceling}>
              {canceling ? "Membatalkan…" : "Ya, batalkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
