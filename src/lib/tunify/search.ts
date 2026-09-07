import { spotifyFetch } from "./client";

export type SpotifyImage = {
  url: string;
  height: number | null;
  width: number | null;
};

export type SpotifySearchArtist = {
  id: string;
  name: string;
  href: string;
  uri: string;
  type: "artist";
  images?: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
};

export type SpotifySearchAlbum = {
  id: string;
  name: string;
  href: string;
  uri: string;
  type: "album";
  images: SpotifyImage[];
  release_date?: string;
  artists: {
    id: string;
    name: string;
    href: string;
    uri: string;
    external_urls: {
      spotify: string;
    };
  }[];
  external_urls: {
    spotify: string;
  };
};

export type SpotifySearchTrack = {
  id: string;
  name: string;
  href: string;
  uri: string;
  type: "track";
  duration_ms: number;
  explicit: boolean;

  artists: {
    id: string;
    name: string;
    href: string;
    uri: string;
    external_urls: {
      spotify: string;
    };
  }[];

  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
  };

  external_urls: {
    spotify: string;
  };
};

export type SpotifySearchPlaylist = {
  id: string;
  name: string;
  href: string;
  uri: string;
  type: "playlist";

  description?: string;

  images: SpotifyImage[];

  external_urls: {
    spotify: string;
  };

  owner?: {
    display_name?: string;
  };
};

type SpotifyPaging<T> = {
  href: string;
  items: T[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
};

export type SpotifySearchResponse = {
  tracks?: SpotifyPaging<SpotifySearchTrack>;
  artists?: SpotifyPaging<SpotifySearchArtist>;
  albums?: SpotifyPaging<SpotifySearchAlbum>;
  playlists?: SpotifyPaging<SpotifySearchPlaylist | null>;
};

export async function searchSpotify(
  query: string
): Promise<SpotifySearchResponse> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {};
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    type: "track,artist,album,playlist",
    limit: "6",
  });

  return spotifyFetch<SpotifySearchResponse>(
    `/search?${params.toString()}`
  );
}
