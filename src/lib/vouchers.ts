import { api } from "@/lib/api";
import type { Voucher, VoucherInput } from "@/types/event";

export function createVoucher(eventId: string, input: VoucherInput) {
  return api.post<Voucher>(`/voucher/${eventId}`, input);
}
