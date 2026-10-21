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
