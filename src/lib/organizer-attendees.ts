import { api } from "@/lib/api";
import { toQuery, type PageParams } from "@/types/pagination";

export type OrganizerAttendee = {
  transactionId: string;
  name: string;
  ticketQuantity: number;
  totalPricePaid: number;
};

export type OrganizerAttendeesPage = {
  data: OrganizerAttendee[];
  pagination: {
    total: number;
    limit: number;
    hasNextPage: boolean;
    nextCursor: string | null;
  };
};

export function getOrganizerEventAttendees(
  eventId: string,
  { limit = 12, cursor }: PageParams = {},
) {
  return api.getWithResponse<OrganizerAttendeesPage>(
    `/events/organizer/events/${encodeURIComponent(eventId)}/attendees${toQuery({ limit, cursor })}`,
  );
}
