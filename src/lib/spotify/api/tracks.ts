import type { SpotifyTopTracksResponse } from "../types";

import { spotifyFetch } from "./client";

export function getTopTracks() {
  return spotifyFetch<SpotifyTopTracksResponse>(
    "/me/top/tracks?limit=6&time_range=medium_term"
  );
}
