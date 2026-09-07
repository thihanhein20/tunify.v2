"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import Script from "next/script";

import { useSpotifyPlayer } from "@/components/player/useSpotifyPlayer";

type SpotifyPlayerContextValue =
  ReturnType<typeof useSpotifyPlayer>;

const SpotifyPlayerContext =
  createContext<SpotifyPlayerContextValue | null>(null);

export function SpotifyPlayerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const player = useSpotifyPlayer();

  return (
    <SpotifyPlayerContext.Provider value={player}>
      <Script
        src="https://sdk.scdn.co/spotify-player.js"
        strategy="afterInteractive"
      />

      {children}
    </SpotifyPlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(SpotifyPlayerContext);

  if (!context) {
    throw new Error(
      "usePlayer must be used inside SpotifyPlayerProvider"
    );
  }

  return context;
}
