import { requireSpotifyConfig, spotifyConfig } from "../config";
import { requestJson, retryDeadline } from "../request";
import type { SpotifyTokenResponse } from "../types";

class SessionExpiredError extends Error {}

type Session = { accessToken: string; refreshToken?: string; expiresAt: number };
const SESSION_KEY = "tunify.session";
const FLOW_KEY = "tunify.pkce";
let refreshPromise: Promise<string> | null = null;
let callbackPromise: Promise<boolean> | null = null;
let generation = 0;
let tokenRetryAt = 0;

const nonemptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

export function readSession(): Session | null {
  const value = sessionStorage.getItem(SESSION_KEY);
  if (!value) return null;
  try {
    const session = JSON.parse(value);
    if (nonemptyString(session.accessToken) && Number.isFinite(session.expiresAt) && (session.refreshToken === undefined || nonemptyString(session.refreshToken))) return session;
  } catch { /* Invalid saved data requires a fresh sign-in. */ }
  sessionStorage.removeItem(SESSION_KEY);
  return null;
}

export function logout() {
  generation++;
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(FLOW_KEY);
  window.dispatchEvent(new Event("tunify-session"));
}

export function expireSession() {
  logout();
  window.dispatchEvent(new Event("tunify-session-expired"));
}

function saveTokens(tokens: SpotifyTokenResponse, refreshToken?: string) {
  if (!tokens || !nonemptyString(tokens.access_token) || !Number.isFinite(tokens.expires_in) || tokens.expires_in <= 0 ||
      !Number.isFinite(Date.now() + tokens.expires_in * 1000) ||
      (tokens.refresh_token !== undefined && !nonemptyString(tokens.refresh_token))) {
    throw new Error("Spotify returned an invalid token response. Please try again.");
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? refreshToken,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  }));
  window.dispatchEvent(new Event("tunify-session"));
}

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createChallenge(verifier: string) {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
}

export async function login() {
  requireSpotifyConfig();
  let redirect: URL;
  try { redirect = new URL(spotifyConfig.redirectUri); }
  catch { throw new Error("The configured Spotify redirect URL is invalid."); }
  if (window.location.origin !== redirect.origin) {
    throw new Error(`Open ${redirect.origin}/ to connect Spotify. Sign-in must start on the same site as the configured redirect.`);
  }
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(48)));
  const state = base64url(crypto.getRandomValues(new Uint8Array(24)));
  const challenge = await createChallenge(verifier);
  sessionStorage.setItem(FLOW_KEY, JSON.stringify({ verifier, state, createdAt: Date.now() }));
  const params = new URLSearchParams({
    client_id: spotifyConfig.clientId,
    response_type: "code",
    redirect_uri: spotifyConfig.redirectUri,
    state,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });
  // Spotify is an external OAuth destination, not an internal app route.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`${spotifyConfig.authorizeUrl}?${params}`);
}

async function requestTokens(params: Record<string, string>) {
  requireSpotifyConfig();
  if (Date.now() < tokenRetryAt) {
    throw new Error(`Spotify is busy. Try again in ${Math.ceil((tokenRetryAt - Date.now()) / 1000)} seconds.`);
  }
  const { response, data } = await requestJson<SpotifyTokenResponse & { error?: string }>(spotifyConfig.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: spotifyConfig.clientId, ...params }),
  });
  if (!response.ok) {

    if (data?.error === "invalid_grant") {
      throw new SessionExpiredError("Your Spotify session expired. Connect again to continue.");
    }
    if (response.status === 429) {
      tokenRetryAt = retryDeadline(response.headers.get("Retry-After"));
      throw new Error(`Spotify is busy. Try again in ${Math.ceil((tokenRetryAt - Date.now()) / 1000)} seconds.`);
    }
    if (response.status >= 500) throw new Error("Spotify is temporarily unavailable. Please try again shortly.");
    throw new Error("Spotify couldn’t authorize this app. Check the client ID and registered redirect URL.");
  }
  return data;
}

export function completeLogin(): Promise<boolean> {
  if (callbackPromise) return callbackPromise;
  callbackPromise = (async () => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("code") && !params.has("error")) return Boolean(readSession());
    const saved = sessionStorage.getItem(FLOW_KEY);
    sessionStorage.removeItem(FLOW_KEY);
    window.history.replaceState(null, "", window.location.pathname);
    if (params.has("error")) throw new Error("Spotify connection was cancelled. You can try again.");
    const flow = saved ? JSON.parse(saved) : null;
    if (!flow || typeof flow.verifier !== "string" || !Number.isFinite(flow.createdAt) || !params.get("state") || flow.state !== params.get("state") || Date.now() - flow.createdAt > 600_000) {
      throw new Error("This sign-in link is invalid or expired. Please connect again.");
    }
    const version = generation;
    const tokens = await requestTokens({ grant_type: "authorization_code", code: params.get("code")!, code_verifier: flow.verifier, redirect_uri: spotifyConfig.redirectUri });
    if (version !== generation) return false;
    saveTokens(tokens);
    return true;
  })().finally(() => { callbackPromise = null; });
  return callbackPromise;
}

export async function getAccessToken(forceRefresh = false): Promise<string> {
  const session = readSession();
  if (!session) throw new Error("Connect Spotify to search.");
  if (!forceRefresh && Date.now() < session.expiresAt - 60_000) return session.accessToken;
  if (!refreshPromise) {
    const version = generation;
    refreshPromise = (async () => {
      try {
        if (!session.refreshToken) throw new SessionExpiredError("Your Spotify session expired. Connect again to continue.");
        const tokens = await requestTokens({ grant_type: "refresh_token", refresh_token: session.refreshToken });
        if (version !== generation) throw new Error("You have logged out.");
        saveTokens(tokens, session.refreshToken);
        return tokens.access_token;
      } catch (error) {
        if (version === generation && error instanceof SessionExpiredError) expireSession();
        throw error;
      }
    })().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}
