import { cookies } from "next/headers";

import { SPOTIFY_COOKIES } from "./cookies";

export async function hasSpotifySession(): Promise<boolean> {
  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get(SPOTIFY_COOKIES.accessToken)?.value;

  const refreshToken =
    cookieStore.get(SPOTIFY_COOKIES.refreshToken)?.value;

  return Boolean(accessToken || refreshToken);
}
