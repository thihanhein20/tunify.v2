import { NextRequest, NextResponse } from "next/server";

import { exchangeCodeForTokens } from "@/lib/tunify/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  const storedState = request.cookies.get(
    "spotify_oauth_state"
  )?.value;

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
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
      new URL("/dashboard", request.url)
    );

    response.cookies.delete("spotify_oauth_state");

    response.cookies.set(
      "spotify_access_token",
      tokens.access_token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: tokens.expires_in,
      }
    );

    if (tokens.refresh_token) {
      response.cookies.set(
        "spotify_refresh_token",
        tokens.refresh_token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        }
      );
    }

    return response;
  } catch (error) {
    console.error("Spotify OAuth callback failed", error);

    return NextResponse.redirect(
      new URL("/?error=spotify_auth_failed", request.url)
    );
  }
}
