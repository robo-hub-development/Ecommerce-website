import { z } from "zod";

export const SEARCH_MIN_CHARS = 2;
export const SEARCH_MAX_CHARS = 100;

export const searchQuerySchema = z.string().trim().min(SEARCH_MIN_CHARS).max(SEARCH_MAX_CHARS);
