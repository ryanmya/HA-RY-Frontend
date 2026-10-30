export type TypeEvent = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  rating?: number;
  /** ISO date string, e.g. "2026-10-04" — format it for display in the UI */
  startDate: string;
  endDate?: string | "" | undefined;
  place: string;
  price: number;
  discountedPrice?: number;
  seats?: number;
  /** Voucher discount in percent, e.g. 25 */
  voucherPercent?: number;
};

// Matches the backend's eventInputSchema (POST/PATCH /events/event).
export type TicketTypeInput = {
  name: string;
  price: number;
};

export type EventInput = {
  id?: string;
  name: string;
  description: string;
  category: string;
  location: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  availableSeats: number;
  isFree: boolean;
  ticketTypes: TicketTypeInput[];
  eventPicture?: File,
};

// Matches the backend's voucherInputSchema (POST /voucher/:eventId).
export type VoucherInput = {
  /** 3-20 uppercase letters and numbers */
  code: string;
  /** Fixed discount in IDR */
  discountAmount: number;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
};

// A voucher row as the backend returns it. Dates are ISO date-times; the amount is a decimal string.
export type Voucher = {
  id: string;
  eventId: string;
  code: string;
  discountAmount: string | number;
  startDate: string;
  endDate: string;
  status: "AVAILABLE" | "REDEEMED" | "EXPIRED";
};

// A locally saved, unpublished event. `id` is the draft's own id, not the backend event id.
export type EventDraft = {
  id: string;
  updatedAt: string;
  event: EventInput;
};

// An event row as the backend returns it. Dates are full ISO date-times and prices are decimal strings.
export type OrganizerEvent = Omit<EventInput, "id" | "ticketTypes" | "eventPicture"> & {
  id: string;
  organizerId: string;
  eventOrganizerName: string;
  createdAt: string;
  updatedAt: string;
  /** Image URL; the request sends a File under the same name. */
  eventPicture?: string | null;
  // Only present when the backend includes them.
  ticketTypes?: { id: string; name: string; price: string | number }[];
  vouchers?: Voucher[];
};

// An event in a list response. The backend adds summary fields instead of sending every ticket type and voucher.
export type EventSummary = OrganizerEvent & {
  /** Cheapest ticket price; 0 for free events. Decimal string or number. */
  lowestPrice?: string | number;
  /** The active voucher with the biggest discount, if any. */
  bestVoucher?: Pick<Voucher, "code" | "discountAmount"> | null;
};
