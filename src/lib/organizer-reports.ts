import { api } from "@/lib/api";

export type OrganizerReportTimelineItem = {
  period: string;
  transactions: number;
  completedTransactions: number;
  waitingPayment: number;
  waitingConfirmation: number;
  ticketsSold: number;
  revenue: number;
};

export type OrganizerReportEvent = {
  id: string;
  name: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  availableSeats: number;
  isFree: boolean;
  createdAt: string;
  transactionCount: number;
  ticketsSold: number;
  revenue: number;
  reviewCount: number;
  averageRating: number | null;
};

export type OrganizerReport = {
  dateRange: {
    from: string;
    to: string;
  };
  overview: {
    events: {
      total: number;
      upcoming: number;
      ongoing: number;
      completed: number;
    };
    transactions: {
      total: number;
      waitingPayment: number;
      waitingConfirmation: number;
      done: number;
      rejected: number;
      expired: number;
      canceled: number;
    };
    ticketsSold: number;
    revenue: number;
    pendingPaymentAmount: number;
  };
  timeline: OrganizerReportTimelineItem[];
  events: OrganizerReportEvent[];
  pagination: {
    eventTotal: number;
    hasNextPage: boolean;
    nextCursor: string | null;
  };
};

export function getOrganizerReport() {
  return api.get<OrganizerReport>("/events/organizer/reports");
}
