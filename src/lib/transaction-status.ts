import type { TransactionStatus } from "@/types/transaction";

export const statusLabel: Record<TransactionStatus, string> = {
  WAITING_PAYMENT: "Menunggu pembayaran",
  WAITING_CONFIRMATION: "Menunggu konfirmasi",
  DONE: "Selesai",
  REJECTED: "Ditolak",
  CANCELED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
};

export const statusVariant: Record<TransactionStatus, "default" | "warning" | "success" | "destructive" | "muted"> = {
  WAITING_PAYMENT: "warning",
  WAITING_CONFIRMATION: "default",
  DONE: "success",
  REJECTED: "destructive",
  CANCELED: "muted",
  EXPIRED: "muted",
};
