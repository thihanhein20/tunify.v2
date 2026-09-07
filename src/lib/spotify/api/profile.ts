import type { SpotifyUserProfile } from "@/lib/spotify/types";

import { spotifyFetch } from "./client";

export function getCurrentUserProfile() {
  return spotifyFetch<SpotifyUserProfile>("/me");
}
