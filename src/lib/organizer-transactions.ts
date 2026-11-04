import { api } from "@/lib/api";
import { getEventsByOrganizer } from "@/lib/events";
import type { EventSummary } from "@/types/event";
import { toQuery } from "@/types/pagination";

export type OrganizerTransactionSummary = {
  eventName: string;
  start_date: string;
  end_date: string;
  availableSeats: number;
  totalTransaction: number;
  pendingTransaction: number;
  doneTransaction: number;
  expiredTransaction: number;
  cancelledTransaction: number;
  rejectedTransaction: number;
  eventId: string;
};

type TransactionSummaryPage = {
  events: Omit<OrganizerTransactionSummary, "eventId">[];
  eventTotal: number;
  hasNextPage: boolean;
  nextCursor: string | null;
};

export type OrganizerEventTransaction = {
  transactionId: string;
  customerId: string;
  name: string;
  quantity: number;
  totalPrice: number;
  ticketTypeName: string;
  paymentProofUrl: string | null;
  status:
    | "WAITING_PAYMENT"
    | "WAITING_CONFIRMATION"
    | "DONE"
    | "EXPIRED"
    | "CANCELED"
    | "REJECTED";
};

function eventKey(name: string, startDate: string, endDate: string) {
  return `${name}\u0000${startDate.slice(0, 10)}\u0000${endDate.slice(0, 10)}`;
}

async function getAllOrganizerEvents() {
  const events: EventSummary[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | null = null;

  while (true) {
    const page = await getEventsByOrganizer({ limit: 50, cursor });
    events.push(...page.items);
    if (!page.nextCursor) return events;
    if (seenCursors.has(page.nextCursor)) {
      throw new Error("Invalid cursor returned while loading organizer events.");
    }

    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }
}

export async function getOrganizerTransactionSummaries() {
  const summaries: Omit<OrganizerTransactionSummary, "eventId">[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | null = null;
  let eventTotal = 0;
  let firstPage = true;

  while (true) {
    const page: TransactionSummaryPage = await api.get<TransactionSummaryPage>(
      `/events/organizer/all-event/transaction-summary${toQuery({ limit: 50, cursor })}`,
    );
    summaries.push(...page.events);
    if (firstPage) {
      eventTotal = page.eventTotal;
      firstPage = false;
    }
    if (!page.hasNextPage) break;
    if (!page.nextCursor || seenCursors.has(page.nextCursor)) {
      throw new Error("Invalid cursor returned while loading transaction summaries.");
    }

    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }

  const events = await getAllOrganizerEvents();
  const idsByEventKey = new Map<string, string[]>();
  for (const event of events) {
    const key = eventKey(event.name, event.startDate, event.endDate);
    idsByEventKey.set(key, [...(idsByEventKey.get(key) ?? []), event.id]);
  }

  const items = summaries.map((summary) => {
    const key = eventKey(summary.eventName, summary.start_date, summary.end_date);
    const matchingIds = idsByEventKey.get(key);
    const eventId = matchingIds?.shift();
    if (!eventId) {
      throw new Error("Could not match a transaction summary to its event.");
    }
    return { ...summary, eventId };
  });

  return { events: items, eventTotal };
}

export async function getOrganizerPendingTransactionCount() {
  let count = 0;
  const seenCursors = new Set<string>();
  let cursor: string | null = null;

  while (true) {
    const page: TransactionSummaryPage = await api.get<TransactionSummaryPage>(
      `/events/organizer/all-event/transaction-summary${toQuery({ limit: 25, cursor })}`,
    );
    count += page.events.reduce((total, event) => total + event.pendingTransaction, 0);
    if (!page.hasNextPage) return count;
    if (!page.nextCursor || seenCursors.has(page.nextCursor)) {
      throw new Error("Invalid cursor returned while loading transaction summaries.");
    }

    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }
}

export function getOrganizerEventTransactions(eventId: string) {
  return api.get<OrganizerEventTransaction[]>(`/events/event/${eventId}`);
}

export function updateOrganizerTransactionStatus(
  transactionId: string,
  status: "DONE" | "REJECTED",
) {
  return api.patchWithResponse<unknown>("/transaction/status", {
    id: transactionId,
    status,
  });
}
