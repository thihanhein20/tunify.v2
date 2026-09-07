import { cookies } from "next/headers";
import { cache } from "react";

import { refreshSpotifyAccessToken } from "./auth";
import { SPOTIFY_COOKIES } from "./cookies";
import { spotifyConfig } from "./config";

const TOKEN_EXPIRY_BUFFER_MS = 60_000;

export class SpotifyApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

const getValidAccessToken = cache(
  async (): Promise<string> => {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get(SPOTIFY_COOKIES.accessToken)?.value;

    const refreshToken =
      cookieStore.get(SPOTIFY_COOKIES.refreshToken)?.value;

    const expiresAt = Number(
      cookieStore.get(SPOTIFY_COOKIES.expiresAt)?.value
    );

    const accessTokenIsValid =
      Boolean(accessToken) &&
      Number.isFinite(expiresAt) &&
      Date.now() < expiresAt - TOKEN_EXPIRY_BUFFER_MS;

    if (accessTokenIsValid && accessToken) {
      return accessToken;
    }

    if (!refreshToken) {
      throw new SpotifyApiError(
        "Spotify authentication required",
        401
      );
    }

    // Refresh for this server request only.
    // Cookie persistence happens in a Route Handler.
    const tokens =
      await refreshSpotifyAccessToken(refreshToken);

    return tokens.access_token;
  }
);

type SpotifyFetchOptions = Omit<
  RequestInit,
  "headers"
> & {
  headers?: HeadersInit;
};

export async function spotifyFetch<T>(
  endpoint: string,
  options: SpotifyFetchOptions = {}
): Promise<T> {
  const accessToken = await getValidAccessToken();

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${spotifyConfig.apiUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  if (response.status === 429) {
    const retryAfterHeader =
      response.headers.get("Retry-After");

    const retryAfter = retryAfterHeader
      ? Number(retryAfterHeader)
      : undefined;

    throw new SpotifyApiError(
      "Spotify rate limit exceeded",
      429,
      retryAfter
    );
  }

  if (response.status === 401) {
    throw new SpotifyApiError(
      "Spotify session expired",
      401
    );
  }

  if (!response.ok) {
    let message = "Spotify API request failed";

    try {
      const body = await response.json();

      if (
        body?.error?.message &&
        typeof body.error.message === "string"
      ) {
        message = body.error.message;
      }
    } catch {
      // Response was not JSON.
    }

    throw new SpotifyApiError(
      message,
      response.status
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
