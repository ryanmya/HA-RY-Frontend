import { api } from "@/lib/api";
import type { EventInput, EventSummary, OrganizerEvent } from "@/types/event";
import { toQuery, type PageParams, type Paginated } from "@/types/pagination";
//get
// Public list of active events, for the homepage.
export function getEvents({ limit = 12, cursor }: PageParams = {}) {
  return api.get<Paginated<EventSummary>>(`/events${toQuery({ limit, cursor })}`);
}

// The logged-in organizer's events; the backend reads the organizer from the access token.
export function getEventsByOrganizer({ limit = 12, cursor }: PageParams = {}) {
  return api.get<Paginated<EventSummary>>(`/events/organizer/all-event${toQuery({ limit, cursor })}`);
}

export function getEventById(id: string) {
  return api.get<OrganizerEvent>(`/events/${id}`);
}
//post
export function createEvent(input: EventInput) {
  return api.post<unknown>("/events/event", input);
}
//patch
// The backend expects the full event (with `id`), not just the changed fields.
export function updateEvent(input: EventInput & { id: string }) {
  return api.patch<OrganizerEvent>("/events/event", input);
}
