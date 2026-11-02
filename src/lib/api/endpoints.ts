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

  // Orders and payments
  ORDERS: "/orders",
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  ORDER_CANCEL: (id: string) => `/orders/${id}/cancel`,
  PAYMENT_STATUS: (reference: string) => `/payments/${reference}`,

  // Our own route handlers (BFF): same-origin, hold the session in an httpOnly cookie
  BFF_AUTH_SEND_OTP: "/api/auth/otp/send",
  BFF_AUTH_VERIFY_OTP: "/api/auth/otp/verify",
  BFF_AUTH_ME: "/api/auth/me",
  BFF_AUTH_LOGOUT: "/api/auth/logout",
  /** Browser calls with `auth: true` go through this proxy, which adds the session token server-side. */
  BFF_PROXY: "/api/bff",

  // Social feeds (the backend holds the YouTube / Instagram credentials)
  CONTENT_YOUTUBE: "/content/youtube",
  CONTENT_INSTAGRAM: "/content/instagram",

  // Marketing
  NEWSLETTER: "/newsletter",
} as const;
