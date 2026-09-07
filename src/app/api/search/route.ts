import { NextRequest, NextResponse } from "next/server";

import { searchSpotify } from "@/lib/tunify/search";
import { SpotifyApiError } from "@/lib/tunify/client";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  if (query.length > 100) {
    return NextResponse.json(
      { error: "Search query is too long" },
      { status: 400 }
    );
  }

  try {
    const results = await searchSpotify(query);

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    console.error("Spotify search failed", error);

    return NextResponse.json(
      {
        error: "Search failed",
      },
      {
        status: 500,
      }
    );
  }
}
