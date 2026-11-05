// Matches features/feature-3/rating.md.

export type Review = {
  id: string;
  customerId: string;
  eventId: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer: { name: string; profilePicture: string | null };
  /** Only on the organizer history endpoint: the event the review was written for. */
  event?: { id: string; name: string; endDate: string };
};

export type ReviewPage = {
  /** null when there are no reviews. */
  averageRating: number | null;
  totalReviews: number;
  items: Review[];
  nextCursor: string | null;
};

export type ReviewInput = { rating: number; comment: string };
