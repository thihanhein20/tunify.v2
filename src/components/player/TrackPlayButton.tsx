"use client";

import type { ReactNode } from "react";

import { usePlayer } from "./SpotifyPlayerProvider";

type TrackPlayButtonProps = {
  uri: string;
  name: string;
  className: string;
  children: ReactNode;
};

export function TrackPlayButton({ uri, name, className, children }: TrackPlayButtonProps) {
  const { playTrack, isReady, pendingTrackUri } = usePlayer();
  const isPending = pendingTrackUri === uri;

  return (
    <button
      type="button"
      onClick={() => void playTrack(uri)}
      disabled={!isReady || pendingTrackUri !== null}
      aria-label={isPending ? `Starting ${name}` : `Play ${name}`}
      aria-busy={isPending}
      className={`${className} w-full text-left disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      {children}
    </button>
  );
}
