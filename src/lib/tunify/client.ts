import { cookies } from "next/headers";

import { spotifyConfig } from "./config";
import {
  refreshSpotifyAccessToken,
} from "./auth";
import {
  SPOTIFY_COOKIES,
  spotifyCookieOptions,
} from "./cookies";

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

async function getValidAccessToken(): Promise<string> {
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

  const tokens =
    await refreshSpotifyAccessToken(refreshToken);

  const newExpiresAt =
    Date.now() + tokens.expires_in * 1000;

  /*
   * NOTE:
   * This works when called from a Route Handler / Server Action.
   * Direct cookie mutation from arbitrary Server Components
   * is restricted by Next.js.
   */
  cookieStore.set(
    SPOTIFY_COOKIES.accessToken,
    tokens.access_token,
    {
      ...spotifyCookieOptions,
      maxAge: tokens.expires_in,
    }
  );

  cookieStore.set(
    SPOTIFY_COOKIES.expiresAt,
    newExpiresAt.toString(),
    {
      ...spotifyCookieOptions,
      maxAge: tokens.expires_in,
    }
  );

  if (tokens.refresh_token) {
    cookieStore.set(
      SPOTIFY_COOKIES.refreshToken,
      tokens.refresh_token,
      {
        ...spotifyCookieOptions,
        maxAge: 60 * 60 * 24 * 180,
      }
    );
  }

  return tokens.access_token;
}

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

    const retryAfter =
      retryAfterHeader !== null
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
        typeof body === "object" &&
        body !== null &&
        "error" in body
      ) {
        const error = body.error;

        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
        ) {
          message = error.message;
        }
      }
    } catch {
      // Ignore malformed/non-JSON Spotify responses.
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
