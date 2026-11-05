# Transaction Flow (Customer Side)

This covers how a customer buys tickets: every step, the endpoint behind it, what to send, and what comes back.

Base URL: `/api`. Every endpoint below needs a **customer** access token:

```
Authorization: Bearer <accessToken>
```

---

## 1. The flow

```
 Event detail page
        │  pick a ticket type + quantity
        ▼
 ① Checkout ─────────────► status: WAITING_PAYMENT   (seats held, 1-hour timer starts)
        │
        ▼
 ② Cart: edit quantity, voucher, coupon, points    (repeat as often as needed)
        │
        ▼
 ③ Upload payment proof ─► status: WAITING_CONFIRMATION   (cart locked)
        │
        ▼
 ④ Organizer reviews ────► DONE      (approved)
                          └► REJECTED  (seats, coupon and points returned)

 ⑤ My transactions: the customer sees the result (DONE / REJECTED)

 At any point during ②–③ the customer can cancel ──► CANCELED (everything returned)
 If no proof is uploaded before expiresAt ─────────► EXPIRED  (expiry job, not built yet)

 Free events: ① goes straight to DONE.
```

### What each status means for the UI

| Status | Meaning | Customer can |
|---|---|---|
| `WAITING_PAYMENT` | Cart is open and the seats are held | edit the cart, upload proof, cancel |
| `WAITING_CONFIRMATION` | Proof uploaded; waiting for the organizer | cancel |
| `DONE` | Approved, or a free event | view only |
| `REJECTED` | The organizer rejected the payment | view only |
| `CANCELED` | The customer cancelled | view only |
| `EXPIRED` | The 1-hour payment window passed | view only |

---

## 2. Data shapes

### Transaction (returned by every endpoint below)

```ts
type Transaction = {
  id: string;
  customerId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  pointsUsed: string;          // Decimal sent as a string, e.g. "15000"; use Number()
  voucherId: string | null;
  couponId: string | null;
  totalPrice: string;          // Decimal sent as a string; the final price after all discounts
  status: "WAITING_PAYMENT" | "WAITING_CONFIRMATION" | "DONE" | "REJECTED" | "CANCELED" | "EXPIRED";
  statusUpdatedBy: "CUSTOMER" | "ORGANIZER" | "SYSTEM" | null;
  paymentProofUrl: string | null;
  proofUploadedAt: string | null;       // ISO date
  expiresAt: string;                    // ISO date; the deadline to pay
  confirmationDeadline: string | null;  // ISO date; the organizer should respond before this
  createdAt: string;
  updatedAt: string;
};
```

> **Money fields are strings.** `totalPrice`, `pointsUsed`, `price` and `discountAmount` are database Decimals, and they arrive as strings. Convert them with `Number()` before formatting.

### Error response (every endpoint)

```json
{ "status": 409, "message": "Customer still has the transaction ongoing on the same event" }
```

---

## 3. Endpoints

### ① Checkout: create the transaction

`POST /transaction`

**Body (JSON)**

| Field | Type | Rules |
|---|---|---|
| `ticketTypeId` | string | UUID of a ticket type from the event detail's `ticketTypes` |
| `quantity` | number | an integer from 1 to 10 |

**Response `201`**: `{ message, data: Transaction }`

- Paid event: `status: "WAITING_PAYMENT"`, `totalPrice = price × quantity`, `expiresAt = now + 1 hour`.
- Free event: `status: "DONE"`, `totalPrice: "0"`.

**Errors**

| Code | When | UI action |
|---|---|---|
| 404 | The ticket type wasn't found | Refresh the event page |
| 400 | The event has ended, or there aren't enough seats | Show the message |
| 409 | The customer already has a `WAITING_PAYMENT` cart for this event | Send them to their existing cart (find it with `GET /transaction/me?status=WAITING_PAYMENT`) |

After a successful checkout, go to the cart page with `data.id`.

---

### ② Edit the cart

`PATCH /transaction/:id`

This is only allowed while the status is `WAITING_PAYMENT` and before `expiresAt`.

**Body (JSON). Send the full cart state every time:**

| Field | Type | Rules |
|---|---|---|
| `quantity` | number | required, an integer from 1 to 10 |
| `voucherId` | string \| null | optional. A voucher UUID from the event detail's `vouchers`. `null` or leaving it out means no voucher |
| `couponId` | string \| null | optional. A coupon UUID owned by the customer. `null` or leaving it out means no coupon |
| `usePoints` | boolean | optional. `true` uses the customer's points to pay |

**How the price is calculated (on the server).** The price never goes below 0.

```
subtotal   = ticket price × quantity
− voucher  (event voucher: status AVAILABLE, not past its endDate)
− coupon   (customer's own coupon: not used, not expired)
− points   (if usePoints: the customer's points, soonest-expiring first)
= totalPrice
```

**Response `200`**: `{ message, data: Transaction }`. Show `data.totalPrice` and `data.pointsUsed` from the response. **Don't calculate the price in the UI.**

**Errors**

| Code | When |
|---|---|
| 404 | The transaction, voucher, coupon or ticket type wasn't found |
| 403 | The transaction belongs to another customer |
| 409 | The status isn't `WAITING_PAYMENT` any more (the cart is locked or closed) |
| 400 | The cart has expired, the voucher or coupon is invalid, or there aren't enough seats for a bigger quantity |

**UI tips**

- Debounce the quantity stepper by 300–500 ms, so you send one request instead of one per click.
- Show a countdown to `expiresAt`. When it reaches 0, disable the form.
- Changing the quantity changes the seat hold, so a bigger quantity can fail with "Not enough seats".

---

### ③ Upload payment proof

`PATCH /transaction/:id/payment-proof`

**Body: `multipart/form-data`**

| Field | Type | Rules |
|---|---|---|
| `paymentProof` | file | required. jpg, jpeg, png, gif or webp, up to 5 MB |

```ts
const form = new FormData();
form.append("paymentProof", file);
api.patch(`/transaction/${id}/payment-proof`, form);   // don't set Content-Type yourself
```

**Response `200`**: `{ message, data: Transaction }`, where `status: "WAITING_CONFIRMATION"` and `paymentProofUrl` is set. The cart is now **locked**: editing returns 409.

**Errors**

| Code | When |
|---|---|
| 400 | The file is missing or the wrong type, or the cart has expired |
| 403 | The transaction belongs to another customer |
| 404 | The transaction wasn't found |
| 409 | The status isn't `WAITING_PAYMENT` (the proof was already uploaded, or the transaction was cancelled or expired) |
| 502 / 500 | The upload to the image server failed. Let the customer try again |

---

### Cancel (allowed during ② and ③)

`PATCH /transaction/:id/cancel`

**No body.**

Allowed while the status is `WAITING_PAYMENT` or `WAITING_CONFIRMATION`. Everything is returned:

- the held seats go back to the event;
- the coupon becomes usable again;
- the points come back. **Note:** returned points get a new expiry date, 90 days from the cancellation.

**Response `200`**: `{ message, data: Transaction }` with `status: "CANCELED"`.

**Errors**: `404` not found · `403` not the customer's · `409` the transaction is already final (`DONE`, `REJECTED`, `CANCELED` or `EXPIRED`).

Ask the customer to confirm before cancelling. The action can't be undone.

---

### ⑤ My transactions: list

`GET /transaction/me?status=<STATUS>`

| Query | Type | Rules |
|---|---|---|
| `status` | string | optional. One of the 6 statuses. Leave it out to get all of them |

**Response `200`**: newest first:

```ts
{
  data: Array<Transaction & {
    event: { id: string; name: string; startDate: string; endDate: string; eventPicture: string | null };
    ticketType: { name: string; price: string };
    hasReviewed: boolean;   // true if this customer already reviewed the event
  }>
}
```

An empty list `[]` is normal, not an error. Use it for tabs such as **Active** (`WAITING_PAYMENT`, `WAITING_CONFIRMATION`), **Completed** (`DONE`) and **Closed** (`REJECTED`, `CANCELED`, `EXPIRED`).

---

### ⑤ My transactions: detail

`GET /transaction/me/:id`

**Response `200`**:

```ts
{
  data: Transaction & {
    event: Event;                 // the full event
    ticketType: { id; eventId; name; price: string };
    voucher: { id; code; discountAmount: string; ... } | null;
    coupon: { id; discountAmount: string; expiresAt; ... } | null;
    hasReviewed: boolean;   // true if this customer already reviewed the event
  }
}
```

**Errors**: `404` if the transaction isn't found **or belongs to another customer** (both give the same response on purpose).

Use this page for the result screen:

| Status | Show |
|---|---|
| `WAITING_PAYMENT` | the countdown, "Upload proof", and "Edit cart" |
| `WAITING_CONFIRMATION` | "Waiting for the organizer", the uploaded proof, and the `confirmationDeadline` |
| `DONE` | "Payment approved", ticket details |
| `REJECTED` | "Payment rejected", and a note that the coupon and points were returned |
| `CANCELED` / `EXPIRED` | "Order closed" |

The customer also gets an **email** when the organizer approves or rejects.

---

## 4. Endpoint summary

| Step | Method | Path | Body |
|---|---|---|---|
| ① Checkout | POST | `/transaction` | `{ ticketTypeId, quantity }` |
| ② Edit cart | PATCH | `/transaction/:id` | `{ quantity, voucherId?, couponId?, usePoints? }` |
| ③ Upload proof | PATCH | `/transaction/:id/payment-proof` | form-data `paymentProof` |
| Cancel | PATCH | `/transaction/:id/cancel` | none |
| ⑤ List | GET | `/transaction/me?status=` | none |
| ⑤ Detail | GET | `/transaction/me/:id` | none |

---

## 5. Known gaps (not built yet)

- **No list of the customer's coupons.** The cart's coupon picker has nothing to show yet.
- **Points balance:** `GET /points` exists in code, but its router **isn't mounted** in `app.ts` yet, so it returns 404 for now.
- **Expiry job:** `EXPIRED` isn't set automatically yet. Until it is, an expired cart stays `WAITING_PAYMENT`, but the cart and the proof upload both reject requests once `expiresAt` has passed.
- **No voucher lookup by code.** Choose a voucher from the event detail's `vouchers` list.
