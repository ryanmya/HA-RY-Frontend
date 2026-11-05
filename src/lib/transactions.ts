import { api } from "@/lib/api";
import type {
  CartInput,
  CheckoutInput,
  Transaction,
  TransactionDetail,
  TransactionListItem,
  TransactionStatus,
} from "@/types/transaction";
import { toQuery } from "@/types/pagination";

// Customer purchase flow; see features/feature-2/transaction-flow.md.

// ① Holds the seats. Paid events start WAITING_PAYMENT with a 1-hour expiresAt; free events go straight to DONE.
export function checkout(input: CheckoutInput) {
  return api.post<Transaction>("/transaction", input);
}

// ② The server recalculates totalPrice and pointsUsed; show its numbers, not our own.
export function updateCart(id: string, cart: CartInput) {
  return api.patch<Transaction>(`/transaction/${id}`, cart);
}

// ③ Moves the transaction to WAITING_CONFIRMATION and locks the cart.
export function uploadPaymentProof(id: string, file: File) {
  const form = new FormData();
  form.append("paymentProof", file);
  return api.patch<Transaction>(`/transaction/${id}/payment-proof`, form);
}

// Returns the seats, coupon and points.
export function cancelTransaction(id: string) {
  return api.patch<Transaction>(`/transaction/${id}/cancel`);
}

// Newest first. An empty list is normal.
export function getMyTransactions(status?: TransactionStatus) {
  return api.get<TransactionListItem[]>(`/transaction/me${toQuery({ status })}`);
}

export function getMyTransaction(id: string) {
  return api.get<TransactionDetail>(`/transaction/me/${id}`);
}
