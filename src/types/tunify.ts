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
