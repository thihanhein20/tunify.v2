"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export function useSpotifyPlayer() {
  const playerRef = useRef<Spotify.Player | null>(null);

  const [deviceId, setDeviceId] =
    useState<string | null>(null);

  const [playerState, setPlayerState] =
    useState<Spotify.WebPlaybackState | null>(null);

  const [isReady, setIsReady] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const playbackRequestRef = useRef(false);
  const [pendingTrackUri, setPendingTrackUri] = useState<string | null>(null);

  const playTrack = useCallback(
    async (uri: string) => {
      const player = playerRef.current;
      if (playbackRequestRef.current) return;
      if (!player || !deviceId || !isReady) {
        setError("Tunify player is not ready. Please wait for it to connect.");
        return;
      }

      playbackRequestRef.current = true;
      setPendingTrackUri(uri);
      setError(null);
      try {
        // Important for browser autoplay restrictions.
        await player.activateElement();

        const transferResponse = await fetch(
          "/api/player/transfer",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              deviceId,
            }),
          }
        );

        if (!transferResponse.ok) {
          throw new Error(
            "Unable to transfer Spotify playback"
          );
        }

        const playResponse = await fetch("/api/player/play", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deviceId,
            uri,
          }),
        });

        if (!playResponse.ok) {
          throw new Error(
            "Unable to start Spotify playback"
          );
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to start Spotify playback");
      } finally {
        playbackRequestRef.current = false;
        setPendingTrackUri(null);
      }
    },
    [deviceId, isReady]
  );

  const getAccessToken = useCallback(async () => {
    const response = await fetch("/api/auth/token", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        "Unable to retrieve Spotify access token"
      );
    }

    const data = (await response.json()) as {
      accessToken: string;
    };

    return data.accessToken;
  }, []);

  useEffect(() => {
    let cancelled = false;

    function initialisePlayer() {
      if (cancelled || !window.Spotify) {
        return;
      }

      if (playerRef.current) {
        return;
      }

      const player = new window.Spotify.Player({
        name: "Tunify Web Player",

        getOAuthToken: async (callback) => {
          try {
            const token = await getAccessToken();

            callback(token);
          } catch (error) {
            console.error(
              "Failed to retrieve Spotify token",
              error
            );

            setError(
              "Unable to authenticate Spotify player."
            );
          }
        },

        volume: 0.5,
      });

      player.addListener(
        "ready",
        ({ device_id }) => {
          console.log(
            "Tunify Spotify player ready:",
            device_id
          );

          setDeviceId(device_id);
          setIsReady(true);
          setError(null);
        }
      );

      player.addListener(
        "not_ready",
        ({ device_id }) => {
          console.warn(
            "Spotify player offline:",
            device_id
          );

          setIsReady(false);
          setDeviceId(null);
        }
      );

      player.addListener(
        "player_state_changed",
        (state) => {
          setPlayerState(state);
        }
      );

      player.addListener(
        "initialization_error",
        ({ message }) => {
          console.error(
            "Spotify initialization error:",
            message
          );

          setError(message);
        }
      );

      player.addListener(
        "authentication_error",
        ({ message }) => {
          console.error(
            "Spotify authentication error:",
            message
          );

          setError(message);
        }
      );

      player.addListener(
        "account_error",
        ({ message }) => {
          console.error(
            "Spotify account error:",
            message
          );

          setError(message);
        }
      );

      player.addListener(
        "playback_error",
        ({ message }) => {
          console.error(
            "Spotify playback error:",
            message
          );

          setError(message);
        }
      );

      player.connect().then((connected) => {
        if (!connected) {
          setError(
            "Spotify Web Playback SDK failed to connect."
          );
        }
      });

      playerRef.current = player;
    }

    if (window.Spotify) {
      initialisePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady =
        initialisePlayer;
    }

    return () => {
      cancelled = true;

      playerRef.current?.disconnect();

      playerRef.current = null;
    };
  }, [getAccessToken]);

  return {
    playerRef,
    playerState,
    deviceId,
    isReady,
    error,
    playTrack,
    pendingTrackUri,
  };
}
