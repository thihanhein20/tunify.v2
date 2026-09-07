import type {
  SpotifyRefreshTokenResponse,
  SpotifyTokenResponse,
} from "@/types/tunify";

import {
  getSpotifyRedirectUri,
  spotifyConfig,
} from "./config";

function getBasicAuthorizationHeader() {
  const { clientId, clientSecret } = spotifyConfig;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials are not configured");
  }

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  return `Basic ${credentials}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<SpotifyTokenResponse> {
  const response = await fetch(spotifyConfig.tokenUrl, {
    method: "POST",

    headers: {
      Authorization: getBasicAuthorizationHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },

    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getSpotifyRedirectUri(),
    }),
  });

  if (!response.ok) {
    console.error(
      "Spotify authorization code exchange failed:",
      response.status
    );

    throw new Error("Failed to exchange Spotify authorization code");
  }

  return response.json();
}

export async function refreshSpotifyAccessToken(
  refreshToken: string
): Promise<SpotifyRefreshTokenResponse> {
  const response = await fetch(spotifyConfig.tokenUrl, {
    method: "POST",

    headers: {
      Authorization: getBasicAuthorizationHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },

    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),

    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    console.error(
      "Spotify token refresh failed:",
      response.status,
      body?.error
    );

    throw new Error("Failed to refresh Spotify access token");
  }

  return response.json();
}
