"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CurrentTrack = {
  id: string;
  name: string;
  uri: string;
  album: {
    name: string;
    images: Array<{
      url: string;
    }>;
  };
  artists: Array<{
    name: string;
  }>;
};

type PlayerState = {
  track: CurrentTrack | null;
  paused: boolean;
  position: number;
  duration: number;
};

export function useSpotifyPlayer() {
  const playerRef = useRef<Spotify.Player | null>(null);

  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [state, setState] = useState<PlayerState>({
    track: null,
    paused: true,
    position: 0,
    duration: 0,
  });

  const getAccessToken = useCallback(async () => {
    const response = await fetch("/api/auth/token");

    if (!response.ok) {
      throw new Error("Unable to retrieve Spotify access token");
    }

    const data: { accessToken: string } = await response.json();

    return data.accessToken;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialisePlayer() {
      if (!window.Spotify) {
        return;
      }

      const player = new window.Spotify.Player({
        name: "Tunify Web Player",

        getOAuthToken: async (callback) => {
          try {
            const token = await getAccessToken();
            callback(token);
          } catch (error) {
            console.error("Unable to provide Spotify token", error);
          }
        },

        volume: 0.5,
      });

      playerRef.current = player;

      player.addListener("ready", ({ device_id }) => {
        if (cancelled) return;

        setDeviceId(device_id);
        setIsReady(true);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.warn("Tunify player offline:", device_id);

        setIsReady(false);
      });

      player.addListener("player_state_changed", (spotifyState) => {
        if (!spotifyState) {
          return;
        }

        setState({
          track: spotifyState.track_window.current_track,
          paused: spotifyState.paused,
          position: spotifyState.position,
          duration: spotifyState.duration,
        });
      });

      player.addListener("initialization_error", ({ message }) => {
        console.error("Spotify initialization error:", message);
      });

      player.addListener("authentication_error", ({ message }) => {
        console.error("Spotify authentication error:", message);
      });

      player.addListener("account_error", ({ message }) => {
        console.error("Spotify account error:", message);
      });

      player.addListener("playback_error", ({ message }) => {
        console.error("Spotify playback error:", message);
      });

      await player.connect();
    }

    window.onSpotifyWebPlaybackSDKReady = initialisePlayer;

    if (window.Spotify) {
      initialisePlayer();
    }

    return () => {
      cancelled = true;

      playerRef.current?.disconnect();
      playerRef.current = null;
    };
  }, [getAccessToken]);

  const togglePlayback = async () => {
    await playerRef.current?.togglePlay();
  };

  const nextTrack = async () => {
    await playerRef.current?.nextTrack();
  };

  const previousTrack = async () => {
    await playerRef.current?.previousTrack();
  };

  const seek = async (position: number) => {
    await playerRef.current?.seek(position);
  };

  const setVolume = async (volume: number) => {
    await playerRef.current?.setVolume(volume);
  };

  return {
    deviceId,
    isReady,
    state,
    togglePlayback,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
  };
}
