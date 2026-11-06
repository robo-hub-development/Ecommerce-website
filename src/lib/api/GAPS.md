# Backend gaps (send this to the backend developer)

Source of truth: `docs/openapi.json` (fetched from `https://backend-w586.onrender.com/api/v1/schema/`, Swagger UI at `/api/docs/`).
Everything below was checked against that spec on 2026-11-05. Items marked **MSW** have a clearly marked mock in
`src/mocks/handlers/` that only runs when `NEXT_PUBLIC_USE_MOCKS=true`; with mocks off the call hits the real backend.

## What already exists and is wired up

`GET/PUT /cart`, `DELETE /cart/items/{id}`, `GET/POST /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel`,
`GET /payments/{reference}`, `POST /payments/webhook` (backend only), auth OTP endpoints, catalogue, `/banners`.

The backend's online payment is **Razorpay Payment Links** (`POST /orders` with `paymentMethod: "online"` returns
`redirectUrl`; the order is created by the webhook; the return page polls `GET /payments/{reference}`).
The checkout modal (Razorpay Standard Checkout) needs the two endpoints in section 1, which do not exist.
Until they do, the frontend falls back to the redirect flow automatically (see README, "Payments (Razorpay)").

## 1. Razorpay Standard Checkout (modal) — MSW fallback

### `POST /payments/razorpay/order` (auth)

Why: the modal needs a Razorpay `order_id` and the exact amount. The frontend never computes the payable amount.

Request (same cart + address shape as `POST /orders`):

```json
{
  "cartId": "uuid",
  "cartItems": ["cart-line-uuid"],
  "address": { "fullName": "...", "mobile": "9876543210", "line1": "...", "line2": "", "city": "...", "state": "...", "pincode": "560001" },
  "paymentMethod": "online"
}
```

Response `200`:

```json
{ "reference": "our-payment-reference", "razorpayOrderId": "order_Abc123", "amount": 59900, "currency": "INR" }
```

- `amount` is in **paise** and must include shipping/discounts: it is what the shopper pays.
- `reference` is the id `GET /payments/{reference}` accepts, so the frontend can poll it.
- Hold stock, as `POST /orders` does for online payments. `400` if the cart is empty, `503` if payments are not configured.

### `POST /payments/razorpay/verify` (auth)

Why: verify the signature with `key_secret` (the frontend never has it) and create the order.

Request: `{ "reference": "...", "razorpayPaymentId": "pay_...", "razorpayOrderId": "order_...", "razorpaySignature": "..." }`

Response `200`: `{ "order": { ...Order } }` (same shape as `GET /orders/{id}`). `400` when the signature does not match.

Also: please make the webhook handle `payment.captured` / `order.paid` for these Razorpay orders and create the order,
so a shopper who pays but loses connectivity (or refreshes) before `verify` still gets an order. The frontend then
finds it by polling `GET /payments/{reference}`.

## 2. Payment-link return URL — please confirm

The frontend serves the return page at **`/checkout/payment`** and reads `reference` or
`razorpay_payment_link_reference_id` from the query string, then polls `GET /payments/{reference}`.
Please confirm the callback URL configured on the payment link and which value `{reference}` expects.

## 3. Cart and order pricing

- `GET /cart` returns only `{ id, items }`. There is no shipping, discount or grand total. The frontend shows a
  bill computed in `src/lib/cart-rules.ts` (free shipping from ₹999, else ₹79; discount from `compareAtPrice`).
  Please return `itemsTotal`, `discount`, `shipping`, `grandTotal` on the cart (and on the order) so the client stops
  guessing and the two can never disagree. `PricedLine` also lacks `compareAtPrice`.
- `Order.total`: does it include shipping? The confirmation page shows `total - sum(items)` as "Shipping & charges".

## 4. Addresses (no endpoints)

- No saved-address endpoints (`GET/POST/PUT /addresses`). The last checkout address is stored on the device
  (`src/store/address.ts`, localStorage, per account). Needed: list/create/update/delete + default flag.
- No pincode lookup (`GET /pincodes/{pincode}` -> `{ city, state, serviceable }`). State and city are typed in by hand.
- `AddressRequest` has no `landmark`, `email` or a separate billing address. The frontend sends the landmark in
  `line2`, uses the account email only to prefill Razorpay, and **does not send** a different billing address
  (it is collected and kept on the device only). Needed: `landmark`, `email`, optional `billingAddress`.
- `Order` has no `address`. The confirmation page shows it only if the API starts returning one (`address` object in
  the `AddressRequest` shape).

## 5. Orders

- `Order` has no `estimatedDelivery` (ISO date). Shown on the confirmation page when present.
- `Order` has no `canReturn`, and there is no `POST /orders/{id}/returns` (multipart: `reason`, `description`, up to
  4 `files`). The return form calls it; **MSW** answers it in mock mode, otherwise it returns 404 (and `canReturn`
  is never true, so the button is hidden).
- `paymentStatus` / `status` are plain strings in the spec. Please document the values; the frontend expects
  `paymentStatus`: `pending | paid | failed | refunded` and `status`: `pending | confirmed | shipped | delivered | cancelled`.

## 6. Other endpoints the frontend calls that are not in the spec (unchanged by this work)

`GET /articles`, `GET /articles/{slug}` (blog), `GET /content/instagram`, `POST /newsletter`, `POST /contact`. Mocked
by MSW in mock mode.
