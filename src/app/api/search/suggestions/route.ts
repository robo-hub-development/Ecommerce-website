import { NextResponse } from "next/server";
import { fetchSearchSuggestions } from "@/lib/api/search-backend";
import { errorResponse } from "@/lib/auth/route-helpers";
import { searchQuerySchema } from "@/lib/validations/search";

export async function GET(request: Request) {
  const parsed = searchQuerySchema.safeParse(new URL(request.url).searchParams.get("q") ?? "");
  // Too short to be worth a backend call.
  if (!parsed.success) return NextResponse.json([]);

  try {
    const suggestions = await fetchSearchSuggestions(parsed.data);
    // Same query, same answer: let the CDN absorb repeated keystrokes.
    return NextResponse.json(suggestions, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    return errorResponse(error);
  }
}
