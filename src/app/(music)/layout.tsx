import type { ReactNode } from "react";

import { SpotifyPlayerProvider } from "@/components/player/SpotifyPlayerProvider";
import { TunifyPlayer } from "@/components/player/TunifyPlayer";

export default function MusicLayout({ children }: { children: ReactNode }) {
  return (
    <SpotifyPlayerProvider>
      <div className="pb-28">{children}</div>
      <TunifyPlayer />
    </SpotifyPlayerProvider>
  );
}
