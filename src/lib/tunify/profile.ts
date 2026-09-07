import type { SpotifyUserProfile } from "@/types/tunify";

import { spotifyFetch } from "./client";

export function getCurrentUserProfile() {
  return spotifyFetch<SpotifyUserProfile>("/me");
}
