import type { SpotifyTopArtistsResponse } from "../types";

import { spotifyFetch } from "./client";

export function getTopArtists() {
  return spotifyFetch<SpotifyTopArtistsResponse>(
    "/me/top/artists?limit=6&time_range=medium_term"
  );
}
