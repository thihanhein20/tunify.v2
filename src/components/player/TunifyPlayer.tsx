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
    <div className="player-shell">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-6">

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
                <p className="truncate text-sm font-medium text-ink">
                  {track.name}
                </p>

                <p className="truncate text-xs text-muted">
                  {track.artists
                    .map((artist) => artist.name)
                    .join(", ")}
                </p>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm font-medium text-ink">
                Your listening room
              </p>

              <p className="text-xs text-muted">
                {isReady
                  ? "Choose a track to start listening"
                  : "Connecting to Spotify..."}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-4">
          <button
            onClick={handlePrevious}
            disabled={!track || !isReady}
            aria-label="Previous track"
            className="text-muted transition hover:text-ink disabled:opacity-30"
          >
            ⏮
          </button>

          <button
            onClick={handleTogglePlay}
            disabled={!track || !isReady}
            aria-label={isPaused ? "Play" : "Pause"}
            className="flex size-10 items-center justify-center rounded-full bg-[#edc26e] text-lg text-[#252820] transition hover:scale-105 disabled:opacity-30"
          >
            {isPaused ? "▶" : "⏸"}
          </button>

          <button
            onClick={handleNext}
            disabled={!track || !isReady}
            aria-label="Next track"
            className="text-muted transition hover:text-ink disabled:opacity-30"
          >
            ⏭
          </button>
        </div>

        {/* Connection */}
        <div className="player-status flex justify-end sm:max-w-52">
          {error ? (
            <p role="alert" className="text-xs text-[#ffb4a1]">
              {error}
            </p>
          ) : (
            <span className="text-xs text-muted">
              {isReady ? "Connected" : "Connecting..."}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
