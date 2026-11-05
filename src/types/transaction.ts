import type { OrganizerEvent, Voucher } from "./event";

// Matches features/feature-2/transaction-flow.md. Money fields are Decimal strings; use Number().

export type TransactionStatus =
  | "WAITING_PAYMENT"
  | "WAITING_CONFIRMATION"
  | "DONE"
  | "REJECTED"
  | "CANCELED"
  | "EXPIRED";

export type Transaction = {
  id: string;
  customerId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  pointsUsed: string;
  voucherId: string | null;
  couponId: string | null;
  /** Final price after every discount. */
  totalPrice: string;
  status: TransactionStatus;
  statusUpdatedBy: "CUSTOMER" | "ORGANIZER" | "SYSTEM" | null;
  paymentProofUrl: string | null;
  proofUploadedAt: string | null;
  /** Deadline to upload the payment proof. */
  expiresAt: string;
  /** The organizer should respond before this. */
  confirmationDeadline: string | null;
  createdAt: string;
  updatedAt: string;
};

// A row of GET /transaction/me.
export type TransactionListItem = Transaction & {
  event: { id: string; name: string; startDate: string; endDate: string; eventPicture: string | null };
  ticketType: { name: string; price: string };
  /** Per event: true once this customer reviewed the event, on every transaction for it. */
  hasReviewed: boolean;
};

// GET /transaction/me/:id.
export type TransactionDetail = Transaction & {
  event: OrganizerEvent;
  ticketType: { id: string; eventId: string; name: string; price: string };
  voucher: Pick<Voucher, "id" | "code" | "discountAmount"> | null;
  coupon: { id: string; discountAmount: string; expiresAt: string } | null;
  hasReviewed: boolean;
};

export type CheckoutInput = { ticketTypeId: string; quantity: number };

// PATCH /transaction/:id always takes the full cart state.
export type CartInput = {
  quantity: number;
  voucherId: string | null;
  couponId: string | null;
  usePoints: boolean;
};
