import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import {
  spotifyConfig,
  getSpotifyRedirectUri,
} from "@/lib/spotify/config";

export async function GET() {
  const { clientId, authorizeUrl, scopes } = spotifyConfig;

  if (!clientId) {
    return NextResponse.json(
      { error: "Spotify client ID is missing" },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getSpotifyRedirectUri(),
    scope: scopes.join(" "),
    state,
  });

  const response = NextResponse.redirect(
    `${authorizeUrl}?${params.toString()}`
  );

  response.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
