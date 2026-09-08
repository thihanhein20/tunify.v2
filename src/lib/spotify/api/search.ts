import { getAccessToken, expireSession } from "../auth/session";
import { spotifyConfig } from "../config";
import { requestJson, retryDeadline } from "../request";
import type { SpotifySearchResponse } from "../types";

let retryAt = 0;

export async function searchSpotify(query: string, signal?: AbortSignal): Promise<SpotifySearchResponse> {
  if (!query.trim()) return {};
  if (Date.now() < retryAt) throw new Error(`Spotify is busy. Try again in ${Math.ceil((retryAt - Date.now()) / 1000)} seconds.`);
  const params = new URLSearchParams({ q: query.trim(), type: "track,artist", limit: "10", market: "AU" });
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await getAccessToken(attempt === 1);
    signal?.throwIfAborted();
    const { response, data } = await requestJson<SpotifySearchResponse>(`${spotifyConfig.apiUrl}/search?${params}`, {
      headers: { Authorization: `Bearer ${token}` }, signal,
    });
    if (response.status === 401 && attempt === 0) continue;
    if (response.status === 401) { expireSession(); throw new Error("Your session expired. Please connect again."); }
    if (response.status === 429) {
      retryAt = retryDeadline(response.headers.get("Retry-After"));
      throw new Error(`Spotify is busy. Try again in ${Math.ceil((retryAt - Date.now()) / 1000)} seconds.`);
    }
    if (response.status === 403) throw new Error("Spotify denied access. Check that this account is authorized in your Spotify app settings.");
    if (!response.ok) throw new Error("Search is unavailable right now. Please try again.");
    return data;
  }
  throw new Error("Please reconnect Spotify.");
}
