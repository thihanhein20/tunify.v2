export const spotifyConfig = {
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "",
  redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ?? "",
  authorizeUrl: "https://accounts.spotify.com/authorize",
  tokenUrl: "https://accounts.spotify.com/api/token",
  apiUrl: "https://api.spotify.com/v1",
};

export function requireSpotifyConfig() {
  if (!spotifyConfig.clientId || !spotifyConfig.redirectUri) {
    throw new Error("Set NEXT_PUBLIC_SPOTIFY_CLIENT_ID and NEXT_PUBLIC_SPOTIFY_REDIRECT_URI, then restart Tunify.");
  }
}
