import { NextRequest, NextResponse } from "next/server";

import { exchangeCodeForTokens } from "@/lib/tunify/auth";
import { getAppUrl } from "@/lib/tunify/config";
import {
  SPOTIFY_COOKIES,
  spotifyCookieOptions,
} from "@/lib/tunify/cookies";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  const storedState =
    request.cookies.get(SPOTIFY_COOKIES.oauthState)?.value;

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(error)}`,
        getAppUrl()
      )
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code is missing" },
      { status: 400 }
    );
  }

  if (!state || !storedState || state !== storedState) {
    return NextResponse.json(
      { error: "Invalid OAuth state" },
      { status: 400 }
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    const response = NextResponse.redirect(
      new URL("/dashboard", getAppUrl())
    );

    const expiresAt =
      Date.now() + tokens.expires_in * 1000;

    response.cookies.delete(SPOTIFY_COOKIES.oauthState);

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
      expiresAt.toString(),
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

          // Spotify currently documents refresh tokens for
          // Developer Dashboard apps as lasting six months.
          maxAge: 60 * 60 * 24 * 180,
        }
      );
    }

    return response;
  } catch (error) {
    console.error("Spotify OAuth callback failed", error);

    return NextResponse.redirect(
      new URL(
        "/?error=spotify_auth_failed",
        getAppUrl()
      )
    );
  }
}
