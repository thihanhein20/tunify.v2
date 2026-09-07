"use client";

import Image from "next/image";

import { usePlayer } from "./SpotifyPlayerProvider";

export function TunifyPlayer() {
  const {
    playerRef,
    playerState,
    isReady,
    error,
  } = usePlayer();

  const track =
    playerState?.track_window.current_track;

  const isPaused = playerState?.paused ?? true;

  const handleTogglePlay = async () => {
    if (!playerRef.current) return;

    await playerRef.current.togglePlay();
  };

  const handlePrevious = async () => {
    if (!playerRef.current) return;

    await playerRef.current.previousTrack();
  };

  const handleNext = async () => {
    if (!playerRef.current) return;

    await playerRef.current.nextTrack();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-zinc-950/95 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">

        {/* Current track */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {track ? (
            <>
              {track.album.images?.[0]?.url && (
                <Image
                  src={track.album.images[0].url}
                  alt={track.name}
                  width={52}
                  height={52}
                  className="size-13 rounded-md object-cover"
                />
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {track.name}
                </p>

                <p className="truncate text-xs text-zinc-400">
                  {track.artists
                    .map((artist) => artist.name)
                    .join(", ")}
                </p>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm font-medium text-white">
                Tunify Web Player
              </p>

              <p className="text-xs text-zinc-500">
                {isReady
                  ? "Choose a track to start listening"
                  : "Connecting to Spotify..."}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5">
          <button
            onClick={handlePrevious}
            disabled={!track}
            aria-label="Previous track"
            className="text-zinc-400 transition hover:text-white disabled:opacity-30"
          >
            ⏮
          </button>

          <button
            onClick={handleTogglePlay}
            disabled={!track}
            aria-label={isPaused ? "Play" : "Pause"}
            className="flex size-10 items-center justify-center rounded-full bg-white text-lg text-black transition hover:scale-105 disabled:opacity-30"
          >
            {isPaused ? "▶" : "⏸"}
          </button>

          <button
            onClick={handleNext}
            disabled={!track}
            aria-label="Next track"
            className="text-zinc-400 transition hover:text-white disabled:opacity-30"
          >
            ⏭
          </button>
        </div>

        {/* Connection */}
        <div className="flex flex-1 justify-end">
          {error ? (
            <p className="text-xs text-red-400">
              {error}
            </p>
          ) : (
            <span className="text-xs text-zinc-500">
              {isReady ? "Connected" : "Connecting..."}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
