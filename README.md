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
| `NEXT_PUBLIC_API_BASE_URL` | client           | Backend base URL for browser calls. Required unless `NEXT_PUBLIC_USE_MOCKS=true`.            |
| `API_BASE_URL`             | server           | Backend base URL for Server Components. Falls back to `NEXT_PUBLIC_API_BASE_URL`.            |
| `NEXT_PUBLIC_USE_MOCKS`    | client + server  | `true` serves every API call from MSW (browser and Node). `false` calls the real backend.    |
| `NEXT_PUBLIC_*_URL`, `NEXT_PUBLIC_SUPPORT_*` | client + server | Social links and support contact details.                                |

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

1. Set `NEXT_PUBLIC_USE_MOCKS=false` and fill `NEXT_PUBLIC_API_BASE_URL` (and `API_BASE_URL` if the server reaches the API at a different address).
2. Edit paths in `endpoints.ts` if they differ from the guide below.
3. Edit `mappers.ts` (and `types/dto.ts`) if response shapes differ.

**Mocks.** With `NEXT_PUBLIC_USE_MOCKS=true`, `client.ts` starts MSW lazily: the service worker in the browser and `msw/node` in Server Components and at build time. Mock OTP code: `123456`.

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
| POST   | `/auth/otp/send`              | no   | Send login / register OTP              | n/a            |
| POST   | `/auth/otp/verify`            | no   | Verify OTP, start session              | n/a            |
| GET    | `/auth/me`                    | yes  | Current user                           | n/a            |
| POST   | `/auth/logout`                | yes  | End session                            | n/a            |
| GET    | `/cart`                       | yes  | Server cart                            | n/a            |
| PUT    | `/cart`                       | yes  | Replace server cart                    | n/a            |
| GET    | `/orders`                     | yes  | Order history (paginated)              | n/a            |
| POST   | `/orders`                     | yes  | Place order (COD) or start payment     | n/a            |
| GET    | `/orders/{id}`                | yes  | Order detail                           | n/a            |
| POST   | `/orders/{id}/cancel`         | yes  | Cancel order                           | n/a            |
| GET    | `/payments/{reference}`       | yes  | Payment result after gateway return    | n/a            |

### Session handling in the frontend (BFF)

The browser only talks to Next.js route handlers, which call the backend:

| Browser calls (same origin)            | What the handler does                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| `POST /api/auth/otp/send`              | Validates with Zod, forwards to `POST /auth/otp/send`                              |
| `POST /api/auth/otp/verify`            | Forwards to `POST /auth/otp/verify`, stores `token` in the httpOnly `srh_session` cookie, returns `{ user }` only |
| `GET /api/auth/me`                     | Calls `GET /auth/me` with the bearer token; clears the cookie on `401`             |
| `POST /api/auth/logout`                | Calls `POST /auth/logout`, clears the cookie                                       |
| `/api/bff/{cart,orders,payments}/...`  | Authenticated proxy: forwards method, query and JSON body to the same backend path with the bearer token |

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

(The article body field for the detail page is not yet specified; it will be added with the blog phase.)

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

Cart rules are enforced by the frontend and must also be enforced by the backend: **max 10 quantity per product**.

#### `GET /cart`  and  `PUT /cart`

`PUT` body replaces the whole cart:

```json
{ "items": [{ "productId": "p_101", "quantity": 2 }] }
```

Both return the priced cart:

```json
{
  "items": [
    { "productId": "p_101", "slug": "esp32-devkit-v1", "name": "ESP32 DevKit V1", "price": 599, "image": "https://...", "quantity": 2 }
  ]
}
```

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
  "canCancel": true
}
```

- `status`: `pending` | `confirmed` | `shipped` | `delivered` | `cancelled`
- `paymentMethod`: `cod` | `online`
- `paymentStatus`: `pending` | `paid` | `failed` | `refunded`
- `canCancel`: **the backend decides.** The Cancel button is shown only when this is `true`.

#### `GET /orders`  (paginated, Auth)

Query: `page`. Returns the pagination envelope of **Order**, newest first.

#### `GET /orders/{id}`  (Auth)

Returns one **Order**; `404` if it is not the caller's.

#### `POST /orders`  (Auth)

```json
{
  "items": [{ "productId": "p_101", "quantity": 1 }],
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

- **COD** (`"cod"`): allowed **only** when the order has exactly one line with quantity 1; otherwise respond `400` with a `message`. Creates the order immediately and returns `{ "order": { ...Order } }`.
- **Online** (`"online"`): do **not** create the order yet. Return the gateway URL: `{ "redirectUrl": "https://gateway.example.com/pay/abc" }`. The order is created after payment succeeds (webhook). The gateway returns the shopper to `{SITE_URL}/checkout/payment?reference={reference}`.

#### `POST /orders/{id}/cancel`  (Auth)

No body. Returns the updated **Order** (`status: "cancelled"`, `canCancel: false`). `400` if the order cannot be cancelled.

#### `GET /payments/{reference}`  (Auth)

Called from the payment return page to resolve the outcome:

```json
{ "status": "success", "order": { "...Order": "present once the order exists" } }
```

`status`: `success` | `failed` | `pending`. The frontend shows a success, failure or still-processing screen accordingly.
