export {};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }

  namespace Spotify {
    interface PlayerInit {
      name: string;

      getOAuthToken: (
        callback: (token: string) => void
      ) => void;

      volume?: number;
    }

    interface WebPlaybackTrack {
      uri: string;
      id: string | null;
      type: string;
      media_type: string;
      name: string;

      album: {
        uri: string;
        name: string;
        images: {
          url: string;
        }[];
      };

      artists: {
        uri: string;
        name: string;
      }[];
    }

    interface WebPlaybackState {
      context: {
        uri: string | null;
        metadata: Record<string, unknown> | null;
      };

      disallows: Record<string, boolean>;

      duration: number;

      paused: boolean;

      position: number;

      repeat_mode: number;

      shuffle: boolean;

      track_window: {
        current_track: WebPlaybackTrack;
        previous_tracks: WebPlaybackTrack[];
        next_tracks: WebPlaybackTrack[];
      };
    }

    type ReadyEvent = {
      device_id: string;
    };

    type ErrorEvent = {
      message: string;
    };

    class Player {
      constructor(options: PlayerInit);

      connect(): Promise<boolean>;

      disconnect(): void;

      addListener(
        event: "ready",
        callback: (event: ReadyEvent) => void
      ): boolean;

      addListener(
        event: "not_ready",
        callback: (event: ReadyEvent) => void
      ): boolean;

      addListener(
        event: "player_state_changed",
        callback: (
          state: WebPlaybackState | null
        ) => void
      ): boolean;

      addListener(
        event:
          | "initialization_error"
          | "authentication_error"
          | "account_error"
          | "playback_error",
        callback: (event: ErrorEvent) => void
      ): boolean;

      removeListener(
        event:
          | "ready"
          | "not_ready"
          | "player_state_changed"
          | "initialization_error"
          | "authentication_error"
          | "account_error"
          | "playback_error"
      ): boolean;

      getCurrentState(): Promise<WebPlaybackState | null>;

      pause(): Promise<void>;

      resume(): Promise<void>;

      togglePlay(): Promise<void>;

      seek(positionMs: number): Promise<void>;

      previousTrack(): Promise<void>;

      nextTrack(): Promise<void>;

      setVolume(volume: number): Promise<void>;

      getVolume(): Promise<number>;

      activateElement(): Promise<void>;
    }
  }
}
