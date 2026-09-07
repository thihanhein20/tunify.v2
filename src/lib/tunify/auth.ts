import { spotifyConfig, getSpotifyRedirectUri } from "./config";
import type { SpotifyTokenResponse } from "@/types/tunify";

export async function exchangeCodeForTokens(
  code: string
): Promise<SpotifyTokenResponse> {
  const { clientId, clientSecret, tokenUrl } = spotifyConfig;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials are not configured");
  }

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getSpotifyRedirectUri(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Spotify authorization code");
  }

  return response.json();
}
