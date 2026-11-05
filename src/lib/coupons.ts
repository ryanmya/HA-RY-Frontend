import { api } from "@/lib/api";

export type Coupon = {
  id: string;
  discountAmount: string;
  expiresAt: string;
};

// The customer's coupons that can still be applied. A coupon already on a cart isn't in this list.
export function getMyCoupons() {
  return api.get<Coupon[]>("/coupons");
}
