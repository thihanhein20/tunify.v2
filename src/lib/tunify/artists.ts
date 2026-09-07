import { spotifyFetch } from "./client";

export type SpotifyArtist = {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: {
    height: number | null;
    url: string;
    width: number | null;
  }[];
  name: string;
  type: "artist";
  uri: string;
};

type SpotifyTopArtistsResponse = {
  items: SpotifyArtist[];
  total: number;
  limit: number;
  offset: number;
};

export function getTopArtists() {
  return spotifyFetch<SpotifyTopArtistsResponse>(
    "/me/top/artists?limit=6&time_range=medium_term"
  );
}
