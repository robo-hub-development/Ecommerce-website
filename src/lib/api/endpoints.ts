/**
 * Every backend path the frontend calls. Paths are relative to the API base URL
 * (NEXT_PUBLIC_API_BASE_URL / API_BASE_URL). When the backend publishes real routes, edit only this file.
 * Functions take the dynamic segment; the MSW handlers reuse them with ":param" placeholders.
 */
export const ENDPOINTS = {
  // Home
  HERO_BANNERS: "/banners",

  // Catalogue
  CATEGORIES: "/categories",
  CATEGORY_BY_SLUG: (slug: string) => `/categories/${slug}`,
  PRODUCTS: "/products",
  PRODUCT_FILTERS: "/products/filters",
  PRODUCT_BY_SLUG: (slug: string) => `/products/${slug}`,
  PRODUCT_RELATED: (slug: string) => `/products/${slug}/related`,
  SEARCH_SUGGESTIONS: "/search/suggestions",

  // Blog
  BLOG_POSTS: "/articles",
  BLOG_POST_BY_SLUG: (slug: string) => `/articles/${slug}`,

  // Auth (OTP, no password)
  AUTH_SEND_OTP: "/auth/otp/send",
  AUTH_VERIFY_OTP: "/auth/otp/verify",
  AUTH_ME: "/auth/me",
  AUTH_LOGOUT: "/auth/logout",

  // Cart
  CART: "/cart",
  /** DELETE: removes one line (by the cart item id from GET /cart) and returns the updated cart. */
  CART_ITEM: (id: string) => `/cart/items/${id}`,

  // Orders and payments
  ORDERS: "/orders",
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  ORDER_CANCEL: (id: string) => `/orders/${id}/cancel`,
  /** GAP: not in the OpenAPI spec, see GAPS.md. */
  ORDER_RETURN: (id: string) => `/orders/${id}/returns`,
  PAYMENT_STATUS: (reference: string) => `/payments/${reference}`,
  /**
   * GAP: not in the backend's OpenAPI spec (docs/openapi.json). Served by MSW only; see src/lib/api/GAPS.md.
   * POST: creates a Razorpay order for the cart and returns { reference, razorpayOrderId, amount (paise), currency }.
   */
  PAYMENT_RAZORPAY_ORDER: "/payments/razorpay/order",
  /** GAP: POST { reference, razorpayPaymentId, razorpayOrderId, razorpaySignature }; the backend verifies the signature. */
  PAYMENT_RAZORPAY_VERIFY: "/payments/razorpay/verify",

  // Our own route handlers (BFF): same-origin, hold the session in an httpOnly cookie
  BFF_AUTH_SEND_OTP: "/api/auth/otp/send",
  BFF_AUTH_VERIFY_OTP: "/api/auth/otp/verify",
  BFF_AUTH_ME: "/api/auth/me",
  BFF_AUTH_LOGOUT: "/api/auth/logout",
  BFF_SEARCH_SUGGESTIONS: "/api/search/suggestions",
  BFF_NEWSLETTER: "/api/newsletter",
  BFF_CONTACT: "/api/contact",
  /** Browser calls with `auth: true` go through this proxy, which adds the session token server-side. */
  BFF_PROXY: "/api/bff",

  // Social feeds (the backend holds the Instagram credentials; YouTube is read from its public feed, see youtube.ts)
  CONTENT_INSTAGRAM: "/content/instagram",

  // Marketing and enquiries
  NEWSLETTER: "/newsletter",
  CONTACT: "/contact",
} as const;
