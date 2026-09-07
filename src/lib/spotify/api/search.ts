import type { SpotifySearchResponse } from "../types";

import { spotifyFetch } from "./client";

export async function searchSpotify(
  query: string
): Promise<SpotifySearchResponse> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {};
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    type: "track,artist,album,playlist",
    limit: "6",
  });

  return spotifyFetch<SpotifySearchResponse>(
    `/search?${params.toString()}`
  );
}
