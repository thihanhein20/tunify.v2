import { spotifyFetch } from "./client";

export type SpotifyTrack = {
  id: string;
  name: string;
  uri: string;
  external_urls: {
    spotify: string;
  };
  album: {
    id: string;
    name: string;
    images: {
      url: string;
      height: number | null;
      width: number | null;
    }[];
  };
  artists: {
    id: string;
    name: string;
  }[];
};

type SpotifyTopTracksResponse = {
  items: SpotifyTrack[];
  total: number;
  limit: number;
  offset: number;
};

export function getTopTracks() {
  return spotifyFetch<SpotifyTopTracksResponse>(
    "/me/top/tracks?limit=6&time_range=medium_term"
  );
}
