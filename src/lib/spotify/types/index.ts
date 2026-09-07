export type SpotifyTokenResponse = {
  access_token: string;
  token_type: "Bearer";
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

export type SpotifyRefreshTokenResponse = {
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

export type SpotifyUserProfile = {
  account_id?: string;
  country?: string;
  display_name: string | null;
  email?: string;

  explicit_content?: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };

  external_urls: {
    spotify: string;
  };

  followers: {
    href: string | null;
    total: number;
  };

  href: string;
  id: string;
  images: SpotifyImage[];
  product?: string;
  type: "user";
  uri: string;
};

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

export type SpotifyTopArtistsResponse = {
  items: SpotifyArtist[];
  total: number;
  limit: number;
  offset: number;
};


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

export type SpotifyTopTracksResponse = {
  items: SpotifyTrack[];
  total: number;
  limit: number;
  offset: number;
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

