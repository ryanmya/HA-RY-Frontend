import { api } from "@/lib/api";
import { toQuery, type PageParams } from "@/types/pagination";

export type CustomerPointStatus = "EXPIRED" | "AVAILABLE" | "REDEEMED";

export type CustomerPoint = {
  id: string;
  customerId: string;
  amount: string;
  expiresAt: string;
  isUsed: boolean;
  status: CustomerPointStatus;
  createdAt: string;
};

export type CustomerPointsPage = {
  data: CustomerPoint[];
  pagination: {
    pointTotal: number;
    hasNextPage: boolean;
    nextCursor: string | null;
  };
};

export function getCustomerPoints({ limit = 5, cursor }: PageParams = {}) {
  return api.getWithResponse<CustomerPointsPage>(
    `/points${toQuery({ limit, cursor })}`,
  );
}
