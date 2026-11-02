import { http, HttpResponse } from "msw";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mockInstagramPosts, mockYoutubeVideos } from "@/mocks/data/content";
import { mockPath } from "@/mocks/handlers/paths";

export const contentHandlers = [
  http.get(mockPath(ENDPOINTS.CONTENT_YOUTUBE), () => HttpResponse.json(mockYoutubeVideos)),
  http.get(mockPath(ENDPOINTS.CONTENT_INSTAGRAM), () => HttpResponse.json(mockInstagramPosts)),
  http.post(mockPath(ENDPOINTS.NEWSLETTER), () => HttpResponse.json({ subscribed: true })),
];
