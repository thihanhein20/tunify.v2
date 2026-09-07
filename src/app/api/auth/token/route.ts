import { NextRequest, NextResponse } from "next/server";

import { refreshSpotifyAccessToken } from "@/lib/spotify/auth/tokens";
import {
  SPOTIFY_COOKIES,
  spotifyCookieOptions,
} from "@/lib/spotify/auth/cookies";

const TOKEN_EXPIRY_BUFFER_MS = 60_000;

export async function GET(request: NextRequest) {
  const accessToken =
    request.cookies.get(SPOTIFY_COOKIES.accessToken)?.value;

  const refreshToken =
    request.cookies.get(SPOTIFY_COOKIES.refreshToken)?.value;

  const expiresAt = Number(
    request.cookies.get(SPOTIFY_COOKIES.expiresAt)?.value
  );

  const accessTokenIsValid =
    accessToken &&
    expiresAt &&
    Date.now() < expiresAt - TOKEN_EXPIRY_BUFFER_MS;

  if (accessTokenIsValid) {
    return NextResponse.json({
      accessToken,
    });
  }

  if (!refreshToken) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const tokens =
      await refreshSpotifyAccessToken(refreshToken);

    const newExpiresAt =
      Date.now() + tokens.expires_in * 1000;

    const response = NextResponse.json({
      accessToken: tokens.access_token,
    });

    response.cookies.set(
      SPOTIFY_COOKIES.accessToken,
      tokens.access_token,
      {
        ...spotifyCookieOptions,
        maxAge: tokens.expires_in,
      }
    );

    response.cookies.set(
      SPOTIFY_COOKIES.expiresAt,
      newExpiresAt.toString(),
      {
        ...spotifyCookieOptions,
        maxAge: tokens.expires_in,
      }
    );

    if (tokens.refresh_token) {
      response.cookies.set(
        SPOTIFY_COOKIES.refreshToken,
        tokens.refresh_token,
        {
          ...spotifyCookieOptions,
          maxAge: 60 * 60 * 24 * 180,
        }
      );
    }

    return response;
  } catch (error) {
    console.error("Spotify session refresh failed", error);

    const response = NextResponse.json(
      { error: "Session expired" },
      { status: 401 }
    );

    response.cookies.delete(SPOTIFY_COOKIES.accessToken);
    response.cookies.delete(SPOTIFY_COOKIES.refreshToken);
    response.cookies.delete(SPOTIFY_COOKIES.expiresAt);

    return response;
  }
}
