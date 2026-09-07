import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/tunify/config";

import { SPOTIFY_COOKIES } from "@/lib/tunify/cookies";

export async function GET() {
  const response = NextResponse.redirect(
    new URL("/", getAppUrl())
  );

  response.cookies.delete(SPOTIFY_COOKIES.accessToken);
  response.cookies.delete(SPOTIFY_COOKIES.refreshToken);
  response.cookies.delete(SPOTIFY_COOKIES.expiresAt);
  response.cookies.delete(SPOTIFY_COOKIES.oauthState);

  return response;
}
