# Stem Robo Hub Frontend

Next.js 15 (App Router) storefront for robotics kits, drones, Arduino boards and sensors. See [CLAUDE.md](CLAUDE.md) for the stack, design and business rules.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then edit
pnpm dev
```

| Command      | Purpose                |
| ------------ | ---------------------- |
| `pnpm dev`   | Development server     |
| `pnpm build` | Production build       |
| `pnpm lint`  | ESLint                 |

## Environment variables

All variables are validated with Zod in `src/lib/env.ts`, which is the only file that reads `process.env`. Import the typed `env` object everywhere else.

| Variable                   | Used by          | Description                                                                                  |
| -------------------------- | ---------------- | -------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | client + server  | Public origin for canonical URLs, sitemap and Open Graph. Required.                          |
| `API_BASE_URL`             | server           | Backend base URL (e.g. `https://host/api/v1`). Server-only; required unless `NEXT_PUBLIC_USE_MOCKS=true`. Its host is also allowed for `next/image`. |
| `NEXT_PUBLIC_USE_MOCKS`    | client + server  | `true` mocks only the endpoints the backend lacks (see `src/lib/api/GAPS.md`: blog, feeds, newsletter, returns, Razorpay order/verify). `false` calls the real backend for everything. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | client        | Public Razorpay key id (`rzp_test_...` / `rzp_live_...`). Optional: when empty, online payment uses the backend's redirect flow. **Never** put `key_secret` in the frontend. |
| `NEXT_PUBLIC_*_URL`        | client + server  | Social links. Business contact details live in `src/config/site.ts`.                         |

## API layer

```
src/lib/env.ts            typed, validated env
src/lib/api/endpoints.ts  every backend path (edit this when real routes are known)
src/lib/api/client.ts     fetch wrapper: base URL, query, JSON, cookies, ISR options, ApiError
src/lib/api/mappers.ts    raw API response -> frontend type (edit this if response shapes differ)
src/lib/api/<domain>.ts   typed service functions: products, categories, blogs, home, auth, cart, orders, content
src/types/dto.ts          raw response shapes (what the backend is expected to send)
src/mocks/                MSW handlers + mock data, matched to endpoints.ts
```

Rules: components and pages call only the service functions; services call `api.*` with paths from `ENDPOINTS` and pass results through a mapper.

**Swapping to the real backend**

1. Set `API_BASE_URL`, and `NEXT_PUBLIC_USE_MOCKS=false` once the backend serves every endpoint.
2. Edit paths in `endpoints.ts` if they differ from the guide below.
3. Edit `mappers.ts` (and `types/dto.ts`) if response shapes differ.

**Server-side only.** The browser never calls the backend: Server Components call it directly, and client components call same-origin route handlers under `src/app/api` (auth, search, newsletter, contact, and the authenticated `/api/bff` proxy). `client.ts` throws if backend code runs in the browser.

**Real API contract.** `docs/openapi.json` is the backend's OpenAPI spec (`/api/v1/schema/`) and `src/types/backend.d.ts` is generated from it (`pnpm dlx openapi-typescript docs/openapi.json -o src/types/backend.d.ts`; named `backend.d.ts` because `src/types/api.ts` already exists). Refresh both when the backend changes. Endpoints the spec lacks are listed in `src/lib/api/GAPS.md`.

**Cold starts and CORS.** The backend runs on Render's free tier and may take 30-60s to answer the first request. `client.ts` uses a 60s timeout and retries GET requests once (also on 502/503/504); the UI shows skeletons while it waits. CORS is not an issue and no dev rewrite proxy is needed: the browser never calls the backend, only same-origin route handlers (`/api/*`, `/api/bff/*`) do, server-side.

**Mocks.** With `NEXT_PUBLIC_USE_MOCKS=true`, `client.ts` starts `msw/node` lazily for Server Components, route handlers and builds. Only endpoints the backend does not serve yet are mocked; everything else passes through to the real API.

## API Integration Guide

Share this section with the backend developer. Paths are relative to the API base URL and are defined in `src/lib/api/endpoints.ts`.

### Conventions

- JSON request and response bodies; `Content-Type: application/json`.
- Authentication uses a **bearer token**. `POST /auth/otp/verify` returns it in the response body; the frontend's own server (a BFF, see below) stores it in an httpOnly cookie and sends `Authorization: Bearer <token>` on every call marked **Auth**. Browsers never call the backend with credentials, so no cookie-based CORS setup is needed (the backend only needs to accept server-to-server calls, plus CORS for the public GET endpoints if they are called from the browser).
- IDs may be strings or numbers; the frontend converts them to strings. Prices are numbers in INR (numeric strings are tolerated). Dates are ISO 8601.
- Unauthenticated access to an **Auth** route returns `401`.
- **Errors**: any non-2xx status with an optional JSON body. The frontend shows `message` and maps `errors` to form fields.

  ```json
  { "message": "Invalid OTP", "errors": { "otp": "That code is incorrect" } }
  ```

  `errors` values may be a string or an array of strings.
- **Pagination envelope** (list endpoints marked *paginated*):

  ```json
  { "items": [], "page": 1, "pageSize": 12, "total": 48, "totalPages": 4 }
  ```

  `totalPages` is optional (derived from `total` / `pageSize`).
- Public catalogue and content endpoints are fetched server-side and cached with ISR (revalidate window shown below), so they must be safe to cache and need no cookie.

### Endpoint summary

| Method | Path                          | Auth | Purpose                                | ISR revalidate |
| ------ | ----------------------------- | ---- | -------------------------------------- | -------------- |
| GET    | `/banners`                    | no   | Home hero slides                       | 10 min         |
| GET    | `/categories`                 | no   | Category tree for menu and home        | 10 min         |
| GET    | `/products`                   | no   | Product list (paginated, filterable)   | 5 min          |
| GET    | `/products/{slug}`            | no   | Product detail                         | 5 min          |
| GET    | `/search/suggestions`         | no   | Search-as-you-type suggestions         | none (client)  |
| GET    | `/articles`                   | no   | Blog posts                             | 10 min         |
| GET    | `/articles/{slug}`            | no   | Blog post                              | 10 min         |
| GET    | `/content/youtube`            | no   | Latest YouTube videos                  | 30 min         |
| GET    | `/content/instagram`          | no   | Latest Instagram reels                 | 30 min         |
| POST   | `/newsletter`                 | no   | Newsletter signup                      | n/a            |
| POST   | `/contact`                    | no   | Contact-form message                   | n/a            |
| POST   | `/auth/otp/send`              | no   | Send login / register OTP              | n/a            |
| POST   | `/auth/otp/verify`            | no   | Verify OTP, start session              | n/a            |
| GET    | `/auth/me`                    | yes  | Current user                           | n/a            |
| POST   | `/auth/logout`                | yes  | End session                            | n/a            |
| GET    | `/cart`                       | yes  | Server cart                            | n/a            |
| PUT    | `/cart`                       | yes  | Replace server cart                    | n/a            |
| DELETE | `/cart/items/{id}`            | yes  | Remove one cart line (id from `GET /cart`) | n/a        |
| GET    | `/orders`                     | yes  | Order history (paginated)              | n/a            |
| POST   | `/orders`                     | yes  | Place order (COD) or start payment     | n/a            |
| GET    | `/orders/{id}`                | yes  | Order detail                           | n/a            |
| POST   | `/orders/{id}/cancel`         | yes  | Cancel order                           | n/a            |
| POST   | `/orders/{id}/returns`        | yes  | Request a return (multipart, photos/videos) | n/a       |
| GET    | `/payments/{reference}`       | yes  | Payment result after gateway return    | n/a            |
| POST   | `/payments/razorpay/order`    | yes  | **Not in backend yet** (GAPS.md): create Razorpay order for the modal | n/a |
| POST   | `/payments/razorpay/verify`   | yes  | **Not in backend yet** (GAPS.md): verify signature, create order | n/a |

### Session handling in the frontend (BFF)

The browser only talks to Next.js route handlers, which call the backend:

| Browser calls (same origin)            | What the handler does                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| `POST /api/auth/otp/send`              | Validates with Zod, forwards to `POST /auth/otp/send`                              |
| `POST /api/auth/otp/verify`            | Forwards to `POST /auth/otp/verify`, stores `token` in the httpOnly `srh_session` cookie, returns `{ user }` only |
| `GET /api/auth/me`                     | Calls `GET /auth/me` with the bearer token; clears the cookie on `401`             |
| `POST /api/auth/logout`                | Calls `POST /auth/logout`, clears the cookie                                       |
| `POST /api/contact`                    | Validates with Zod, drops honeypot submissions, forwards to `POST /contact`        |
| `/api/bff/{cart,orders,payments}/...`  | Authenticated proxy: forwards method, query and JSON (or multipart) body to the same backend path with the bearer token |

`src/middleware.ts` redirects `/account/*` and `/checkout/*` to `/login?next=...` when the cookie is absent, and redirects signed-in visitors away from `/login` and `/register`. The cookie is `httpOnly`, `SameSite=Lax`, and `Secure` in production.

**Mock mode:** the demo account is `demo@robohub.test`; the OTP for every account is `123456`. Registering any new email works and is remembered until the dev server restarts.

### Catalogue

#### `GET /products`  (paginated)

Query params (all optional): `page` (default 1), `pageSize` (default 12), `category` (category slug), `sort` (`newest` | `bestselling`), `q` (text search).

Response: pagination envelope whose `items` are **Product**:

```json
{
  "id": "p_101",
  "slug": "esp32-devkit-v1",
  "name": "ESP32 DevKit V1",
  "summary": "Dual-core Wi-Fi + Bluetooth board",
  "categorySlug": "arduino-boards",
  "categoryName": "Arduino & Boards",
  "price": 599,
  "compareAtPrice": 799,
  "image": "https://cdn.example.com/p/101.jpg",
  "rating": 4.6,
  "reviewCount": 128,
  "inStock": true,
  "isNew": false,
  "soldCount": 420
}
```

`compareAtPrice` is optional (only when discounted). `summary`, `rating`, `reviewCount`, `soldCount`, `inStock`, `isNew` are optional and default to empty / 0 / true / false.

#### `GET /products/{slug}`

Response: one **Product**. `404` if unknown.

#### `GET /search/suggestions`

Query: `q` (required). Returns up to ~5 items:

```json
[{ "slug": "esp32-devkit-v1", "name": "ESP32 DevKit V1", "categoryName": "Arduino & Boards", "price": 599, "image": "https://..." }]
```

#### `GET /categories`

```json
[
  {
    "slug": "robot-kits",
    "name": "Robot Kits",
    "description": "Build-it-yourself rovers, walkers and line followers.",
    "image": "https://...",
    "productCount": 48,
    "children": [{ "slug": "rover-kits", "name": "Rover Kits" }]
  }
]
```

### Home and content

#### `GET /banners`

```json
[
  {
    "id": "b1",
    "eyebrow": "New season",
    "title": "Build your first robot",
    "description": "Kits, sensors and guides in one place.",
    "image": "https://...",
    "imageAlt": "Robot kit on a workbench",
    "primaryCta": { "label": "Shop kits", "href": "/products?category=robot-kits" },
    "secondaryCta": { "label": "Read guides", "href": "/blog" }
  }
]
```

`secondaryCta` is optional. `href` values are site-relative paths.

#### `GET /articles` and `GET /articles/{slug}`

List returns an array; detail returns one object:

```json
{
  "slug": "choosing-your-first-robot-kit",
  "title": "How to choose your first robot kit",
  "excerpt": "Motors, controllers and sensors explained.",
  "image": "https://...",
  "category": "Guides",
  "author": "Stem Robo Hub Team",
  "publishedAt": "2026-10-18",
  "readMinutes": 6
}
```

The detail response also has `content`: the article body as **HTML** (headings, paragraphs, lists, links, images). The frontend sanitizes it with an allow-list before rendering, so scripts, styles and event handlers are dropped.

#### `GET /content/youtube`

The backend owns the YouTube credentials. Return the latest ~4 videos, newest first:

```json
[{ "id": "dQw4w9WgXcQ", "title": "Unboxing the robotic arm", "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "publishedAt": "2026-10-24T09:30:00Z" }]
```

Thumbnail hosts must be allowed in `next.config.ts` `images.remotePatterns` (`i.ytimg.com` already is).

#### `GET /content/instagram`

The backend owns the Instagram token. Return the latest ~6 reels/posts (images only; no videos):

```json
[{ "id": "17900000000000000", "caption": "Our new rover kit", "thumbnail": "https://scontent.cdninstagram.com/...jpg", "permalink": "https://www.instagram.com/reel/XXXX/" }]
```

#### `POST /contact`

Body `{ "name": "Asha", "email": "asha@example.com", "phone": "9876543210", "message": "..." }` -> `{ "sent": true }`. `phone` is a 10-digit Indian mobile number. Use a `400` with `errors.<field>` for invalid input. The honeypot field is filtered out by the frontend and never reaches the backend.

#### `POST /newsletter`

Body `{ "email": "you@example.com" }` -> `{ "subscribed": true }`. Use a `400` with `errors.email` for an invalid address.

### Auth (OTP, no password)

#### `POST /auth/otp/send`

Login:

```json
{ "purpose": "login", "email": "you@example.com" }
```

Register (name, mobile and email are all required for this purpose):

```json
{ "purpose": "register", "email": "you@example.com", "name": "Aarav Mehta", "mobile": "9876543210" }
```

Response `{ "expiresInSeconds": 120 }`. Errors: `400` with `errors` (for example email already registered, or no account for login).

#### `POST /auth/otp/verify`

```json
{ "purpose": "login", "email": "you@example.com", "otp": "123456" }
```

Response `200`:

```json
{
  "user": { "id": "u_1", "name": "Aarav Mehta", "email": "you@example.com", "mobile": "9876543210" },
  "token": "opaque-session-token",
  "expiresInSeconds": 604800
}
```

`expiresInSeconds` is optional (default 7 days) and becomes the cookie lifetime. For `register`, the backend creates the account from the data sent to `/auth/otp/send`. Wrong or expired OTP: `400` with `errors.otp`.

#### `GET /auth/me`

Response `{ "user": { ... } }` (same user shape). `401` when there is no session.

#### `POST /auth/logout`

`204 No Content`; invalidate the token if you track sessions.

### Cart

Cart rules are enforced by the frontend and by the backend: **max 10 quantity per product**, each product once.

#### `GET /cart`  and  `PUT /cart`

`PUT` body replaces the whole cart:

```json
{ "items": [{ "productId": "p_101", "quantity": 2 }] }
```

Both return the priced cart (`id` is null until the first `PUT`; checkout sends it as `cartId`):

```json
{
  "id": "0b8f...-uuid",
  "items": [
    { "id": "6f1c0e2a-...", "productId": "p_101", "slug": "esp32-devkit-v1", "name": "ESP32 DevKit V1", "price": 599, "image": "https://...", "quantity": 2 }
  ]
}
```

Each line has an `id` (cart item id). `DELETE /cart/items/{id}` removes that line and returns the updated cart in the same shape (`404` if the line is not in the caller's cart).

### Orders and payments

**Order** object (returned by several endpoints):

```json
{
  "id": "ord_1002",
  "orderNumber": "SRH-1002",
  "status": "confirmed",
  "paymentMethod": "online",
  "paymentStatus": "paid",
  "items": [{ "productId": "p_101", "slug": "esp32-devkit-v1", "name": "ESP32 DevKit V1", "price": 599, "image": "https://...", "quantity": 1 }],
  "total": 599,
  "placedAt": "2026-10-28T10:15:00Z",
  "canCancel": true,
  "canReturn": false,
  "returnRequest": null
}
```

- `status`: `pending` | `confirmed` | `shipped` | `delivered` | `cancelled`
- `paymentMethod`: `cod` | `online`
- `paymentStatus`: `pending` | `paid` | `failed` | `refunded`
- `canCancel`: **the backend decides.** The Cancel button is shown only when this is `true`.
- `canReturn`: **the backend decides** (e.g. delivered, inside the return window, no open request). The Request Return button is shown only when `true`.
- `returnRequest`: `null`, or `{ "id": "ret_1", "status": "requested", "reason": "damaged", "description": "...", "attachmentCount": 2, "createdAt": "2026-11-01T09:00:00Z" }`. `status`: `requested` | `under_review` | `approved` | `rejected`.

#### `GET /orders`  (paginated, Auth)

Query: `page`. Returns the pagination envelope of **Order**, newest first.

#### `GET /orders/{id}`  (Auth)

Returns one **Order**; `404` if it is not the caller's.

#### `POST /orders`  (Auth)

The order is built from the cart lines named in `cartItems`; quantities and prices come from the server.

```json
{
  "cartId": "uuid from GET /cart",
  "cartItems": ["cart line id from GET /cart"],
  "address": {
    "fullName": "Aarav Mehta",
    "mobile": "9876543210",
    "line1": "12 MG Road",
    "line2": "Near the metro",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "paymentMethod": "cod"
}
```

- **COD** (`"cod"`): allowed **only** for exactly one line with quantity 1 (the frontend also disables it with the reason). Creates the order now: `201 { "order": { ...Order } }`.
- **Online** (`"online"`): no order yet. Stock is held and a Razorpay payment link is created: `200 { "redirectUrl": "https://..." }`. The order is created when the payment succeeds (webhook). The frontend's return page is `/checkout/payment` (see GAPS.md, section 2).

#### `POST /orders/{id}/cancel`  (Auth)

No body. Returns the updated **Order** (`status: "cancelled"`, `canCancel: false`). `400` if the order cannot be cancelled.

#### `POST /orders/{id}/returns`  (Auth)

`multipart/form-data`: `reason` (`damaged` | `defective` | `wrong_item` | `missing_parts` | `other`), `description` (10-1000 chars) and up to 4 `files` (JPG, PNG, WebP, MP4 or MOV, max 4 MB each). Returns the created `returnRequest` object (see **Order**). `400` if the order is not eligible (`canReturn` is `false`) or a field is invalid (`errors.<field>`). The frontend then shows the request's status on the order page.

#### `GET /payments/{reference}`  (Auth)

Called from the payment return page to resolve the outcome:

```json
{ "status": "success", "order": { "...Order": "present once the order exists" } }
```

`status`: `success` | `failed` | `pending`. The frontend shows a success, failure or still-processing screen accordingly.

## Payments (Razorpay)

**Environment**

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | frontend (`.env.local`) | Public key id used to open the checkout modal. |
| `key_secret`, webhook secret | **backend only** | Signature verification and webhooks. They must never appear in this repo, `.env*` files or the browser. |

**Flow (Standard Checkout modal)**

```
Pay online
  1. POST /payments/razorpay/order {cartId, cartItems, address}   -> {reference, razorpayOrderId, amount(paise), currency}
     (the amount is always the backend's; the client never computes it)
  2. checkout.js loads on /checkout only (next/script, lazyOnload); useRazorpay() waits for it
  3. Razorpay modal opens: key, order_id, amount, currency, name, prefill, theme (from --primary)
        dismissed            -> toast "Payment cancelled", stay on checkout, retry allowed
        payment.failed       -> show error.description + "Retry payment" (modal retries stay possible)
        success handler      -> {razorpay_payment_id, razorpay_order_id, razorpay_signature}
  4. POST /payments/razorpay/verify {reference, ...3 values}      -> backend verifies the signature
        ok                   -> /order/{id}/confirmation
        error or timeout     -> "Payment received, confirming your order": poll GET /payments/{reference}
                                every 3s for 60s -> confirmation, or "contact support" (phone/email from site config)
```

State handling lives in `src/lib/payments/` (`payment-state.ts` reducer, `run-payment.ts` orchestration, `poll.ts`, `razorpay.ts`), driven by `src/hooks/use-online-payment.ts`. A second click while a request or the modal is in flight is ignored. The confirmation page loads the order by id, so refresh and the browser back button are safe. Payment details are never logged or stored on the client.

**Today's backend uses payment links, not the modal.** The two endpoints above are not in the backend yet (`src/lib/api/GAPS.md`). Until they are, "Pay online" falls back to `POST /orders` with `paymentMethod: "online"` and redirects to the returned `redirectUrl`; the shopper returns to `/checkout/payment?reference=...`, which polls `GET /payments/{reference}` and then shows the confirmation. The fallback triggers automatically when `NEXT_PUBLIC_RAZORPAY_KEY_ID` is empty or the order endpoint answers 404/405/501. With `NEXT_PUBLIC_USE_MOCKS=true` the modal flow runs against MSW stand-ins (`src/mocks/handlers/account.ts`).

**Testing:** use Razorpay test mode keys (`rzp_test_...`) and the test cards, UPI IDs and failure scenarios in the official docs: https://razorpay.com/docs/payments/payments/test-card-details/ (UPI: https://razorpay.com/docs/payments/payments/test-upi-details/).

**Backend only:** `key_secret`, signature verification, webhooks (`/payments/webhook`) and the order creation they trigger. Email/SMS confirmations are sent by the backend.

## Content TODO before launch

The policy files in `src/content/policies/` contain placeholders that the site highlights on the page. Replace them with real values (do not invent them):

| Placeholder | File(s) |
| ----------- | ------- |
| `[Date]` (Last Updated) | `privacy-terms.md`, `shipping-returns-refunds.md` |
| `[X–Y business days]` (order processing) | `shipping-returns-refunds.md` |
| `[X business days]` (refund initiation) | `shipping-returns-refunds.md` |
| `[Name / Designation]` (privacy contact) | `privacy-terms.md` |
| `[Name and Contact Details]` (grievance officer) | `privacy-terms.md` |
