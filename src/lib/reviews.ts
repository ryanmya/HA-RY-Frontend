import { api } from "@/lib/api";
import type { ReviewInput, ReviewPage } from "@/types/review";
import { toQuery, type PageParams } from "@/types/pagination";

// Customer only. 409 means the customer already reviewed this event.
export function createReview(eventId: string, input: ReviewInput) {
  return api.post<unknown>(`/reviews/event/${eventId}`, input);
}

export function getEventReviews(eventId: string, { limit, cursor }: PageParams = {}) {
  return api.get<ReviewPage>(`/reviews/event/${eventId}${toQuery({ limit, cursor })}`);
}

// Every review across the organizer's events (grouped by company name), newest first.
export function getOrganizerReviews(eventOrganizerName: string, { limit, cursor }: PageParams = {}) {
  return api.get<ReviewPage>(
    `/reviews/organizer/${encodeURIComponent(eventOrganizerName)}${toQuery({ limit, cursor })}`,
  );
}
