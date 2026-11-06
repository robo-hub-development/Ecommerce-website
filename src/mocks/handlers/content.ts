import { http, HttpResponse } from "msw";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mockArticles, mockInstagramPosts, mockSlides } from "@/mocks/data/content";
import { mockPath } from "@/mocks/handlers/paths";

// Only endpoints the backend does not serve yet are mocked; everything else passes through to the real API.
export const contentHandlers = [
  http.get(mockPath(ENDPOINTS.HERO_BANNERS), () => HttpResponse.json(mockSlides)),
  http.get(mockPath(ENDPOINTS.BLOG_POSTS), () => HttpResponse.json(mockArticles)),

  http.get(mockPath(ENDPOINTS.BLOG_POST_BY_SLUG(":slug")), ({ params }) => {
    const article = mockArticles.find((a) => a.slug === params.slug);
    return article ? HttpResponse.json(article) : HttpResponse.json({ message: "Not found" }, { status: 404 });
  }),

  http.get(mockPath(ENDPOINTS.CONTENT_INSTAGRAM), () => HttpResponse.json(mockInstagramPosts)),
  http.post(mockPath(ENDPOINTS.NEWSLETTER), () => HttpResponse.json({ subscribed: true })),
  http.post(mockPath(ENDPOINTS.CONTACT), () => HttpResponse.json({ sent: true })),
];
