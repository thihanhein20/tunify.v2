export const spotifyConfig = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,

  authorizeUrl: "https://accounts.spotify.com/authorize",
  tokenUrl: "https://accounts.spotify.com/api/token",
  apiUrl: "https://api.spotify.com/v1",

  scopes: [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "playlist-read-private",
  ],
};

export function getSpotifyRedirectUri() {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL is not configured");
  }

  return `${appUrl}/api/auth/callback/tunify`;
}
