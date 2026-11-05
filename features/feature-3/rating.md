# Feature 3: Reviews and Organizer Rating

## Goal
Customers review events they attended. The reviews build the **organizer's reputation**, which is shown on that organizer's upcoming events, so new buyers can judge whether to trust them.

## Core idea
- A review is **written for one finished event**.
- Reviews are **shown by organizer** (`eventOrganizerName`), so a brand-new event already shows the organizer's history.
- An organizer is identified by `eventOrganizerName`, which several organizer accounts can share. Ratings and event counts are **company-wide**.

```
Review → Event → eventOrganizerName
```

Example on an upcoming event page:
```
by JakartaFest  ★ 4.7 (85 reviews)
★★★★★ "Great sound!"          on Jazz Evening (Aug 2026)
★★★★☆ "Long queue at entry"   on Indie Fest (Sep 2026)
```

## Rules (decided)
| Rule | Value |
|---|---|
| Who can review | A customer with a `DONE` transaction for the event |
| When | Only after the event has ended (`endDate < now`) |
| How many | **Once per customer per event**, not once per transaction |
| Rating | Required, an integer from 1 to 5 |
| Comment | Required, trimmed, 1–500 characters |
| Edit or delete | **Not allowed**: a review is final |

The schema is unchanged: it uses the existing `Review` table, with no migration. "Once per event" is checked in the service, so the UI should disable the submit button while the request is pending.

## Data model (existing `Review` table)
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `customerId` | uuid | the customer who wrote it |
| `eventId` | uuid | the event it's about |
| `rating` | int | 1–5 |
| `comment` | string | required |
| `createdAt` | datetime | |

---

## Endpoints

Base: `/api/reviews`. List responses show only the customer's `name` and `profilePicture`, never their email.

### 1. Create a review (customer only)
`POST /api/reviews/event/:eventId`
Header: `Authorization: Bearer <customer token>`

```json
{ "rating": 5, "comment": "Great event!" }
```

**Response `201`**: `{ message, data: Review }`

| Code | When |
|---|---|
| 400 | Invalid body (rating not 1–5, empty comment, comment over 500 characters, or an unknown field), or the event hasn't ended yet |
| 401 | Not logged in |
| 403 | Not a customer, or the customer has no `DONE` transaction for this event |
| 404 | The event wasn't found |
| 409 | The customer has already reviewed this event |

### 2. Reviews of one event (public)
`GET /api/reviews/event/:eventId?limit=10&cursor=<reviewId>`

```json
{
  "data": {
    "averageRating": 4.5,
    "totalReviews": 12,
    "items": [
      { "id": "...", "customerId": "...", "eventId": "...", "rating": 5, "comment": "...", "createdAt": "...",
        "customer": { "name": "...", "profilePicture": "...|null" } }
    ],
    "nextCursor": "<reviewId>" 
  }
}
```
`nextCursor` is `null` on the last page. Returns `404` if the event isn't found.

### 3. Organizer review history (public)
`GET /api/reviews/organizer/:eventOrganizerName?limit=10&cursor=<reviewId>`

Covers every event by that organizer. Use it on upcoming event pages and on the organizer profile.

Same shape as endpoint 2, and each item also has:
```json
"event": { "id": "...", "name": "Jazz Evening", "endDate": "..." }
```
An unknown organizer name returns an empty list (`averageRating: null`, `totalReviews: 0`), not an error.

### 4. Organizer public profile (public)
`GET /api/organizer/public/:organizerId`

```json
{ "data": { "id": "...", "name": "...", "eventOrganizerName": "...", "profilePicture": "...|null",
            "totalEvents": 5, "averageRating": 4.3, "totalReviews": 12 } }
```
`totalEvents`, `averageRating` and `totalReviews` cover the whole company (`eventOrganizerName`). Returns `404` if the organizer isn't found.

### Pagination (endpoints 2 and 3)
| Query | Rules |
|---|---|
| `limit` | 1–50, default 10 |
| `cursor` | optional; the `nextCursor` from the previous page |

Results are newest first. Use the same infinite-scroll pattern as the events list.

> `averageRating` is a number, or `null` when there are no reviews. Show "No reviews yet" when `totalReviews` is 0.

---

## Backend structure
| Layer | File |
|---|---|
| Validator | `src/validators/review.validator.ts` |
| Repository | `src/repositories/review.repository.ts` |
| Service | `src/modules/review/review.service.ts` |
| Controller | `src/modules/review/review.controller.ts` |
| Router | `src/routers/review.router.ts`, mounted at `/api/reviews` in `app.ts` |
| Organizer profile | `findPublicProfileById` in `organizer.repository.ts`, route in `organizer.router.ts` |

## Frontend
- **Upcoming event detail page:** an organizer block with the ★ average and review count (endpoint 3, `limit=3`), and a "See all reviews" link to the organizer page.
- **Organizer profile page:** endpoint 4, plus the full review list from endpoint 3.
- **My transactions (detail page):** show a "Write a review" button when `status === "DONE"`, `event.endDate` has passed, and `hasReviewed === false`. `hasReviewed` comes from `GET /transaction/me` and `/transaction/me/:id`, and is per event, so it's the same on every transaction for that event.
- **Review form:** a 1–5 star picker and a required comment (500-character limit). Show the server's error message.

## Not included (for now)
- Editing or deleting reviews.
- The rating on event list cards.
- A minimum number of reviews before an average is shown.
