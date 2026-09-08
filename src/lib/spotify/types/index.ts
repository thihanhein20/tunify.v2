export type SpotifyTokenResponse = {
  access_token: string;
  token_type: "Bearer";
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

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
};

