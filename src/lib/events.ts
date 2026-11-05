import { api } from "@/lib/api";
import type { EventInput, EventSummary, OrganizerEvent } from "@/types/event";
import { toQuery, type PageParams } from "@/types/pagination";
//get
export type EventFilters = {
  /** Free text; the backend matches it against every text field (name, location, category, description…). */
  search?: string;
  /** YYYY-MM-DD; events running at any point between `from` and `to` (inclusive). */
  from?: string;
  to?: string;
};

type EventListResponse = {
  data: EventSummary[] | {
    items: EventSummary[];
    nextCursor?: string | null;
  };
  pagination?: {
    nextCursor?: string | null;
  };
};

// Public list of active events, for the homepage.
export async function getEvents({ limit = 12, cursor, search, from, to }: PageParams & EventFilters = {}) {
  const response = await api.getWithResponse<EventListResponse>(
    `/events/all-event${toQuery({ limit, cursor, search, from, to })}`,
  );

  if (Array.isArray(response.data)) {
    return {
      items: response.data,
      nextCursor: response.pagination?.nextCursor ?? null,
    };
  }

  return {
    items: response.data.items,
    nextCursor: response.data.nextCursor ?? null,
  };
}

// The logged-in organizer's events; the backend reads the organizer from the access token.
export async function getEventsByOrganizer({ limit, cursor }: PageParams = {}) {
  const page = await api.get<OrganizerEventPage>(
    `/events/organizer/all-event${toQuery({ limit, cursor })}`,
  );
  return {
    items: page.events,
    nextCursor: page.hasNextPage ? page.nextCursor : null,
  };
}

type OrganizerEventPage = {
  events: EventSummary[];
  hasNextPage: boolean;
  nextCursor: string | null;
  eventTotal: number;
};

export async function getOrganizerEventCount() {
  const page = await api.get<OrganizerEventPage>(
    `/events/organizer/all-event${toQuery({ limit: 2 })}`,
  );
  return page.eventTotal;
}

export function getEventById(id: string) {
  return api.get<OrganizerEvent>(`/events/${id}`);
}
// Plain JSON, or multipart when `eventPicture` is set. Files go as they are; other
// non-string values (ticketTypes, numbers, booleans) are JSON-encoded for the backend to parse.
function toBody(input: EventInput) {
  if (!input.eventPicture) return input;
  const form = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined) return;
    form.append(key, value instanceof File || typeof value === "string" ? value : JSON.stringify(value));
  });
  return form;
}
//post
// Checkout needs a ticketTypeId even for free events, so they get one zero-price ticket type.
export const FREE_TICKET_TYPES = [{ name: "Gratis", price: 0 }];

export function createEvent(input: EventInput) {
  return api.post<unknown>("/events/event", toBody(input));
}
//patch
// The backend validates the full event (with `id`), not just the changed fields.
export function updateEvent(input: EventInput & { id: string }) {
  return api.patch<OrganizerEvent>("/events/organizer/edit-event", toBody(input));
}
