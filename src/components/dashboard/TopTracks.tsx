import Image from "next/image";
import { TrackPlayButton } from "@/components/player/TrackPlayButton";

import type { SpotifyTrack } from "@/lib/spotify/types";

type TopTracksProps = {
  tracks: SpotifyTrack[];
};

export function TopTracks({ tracks }: TopTracksProps) {
  return (
    <section className="music-panel min-w-0">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="eyebrow">The ones on repeat</p>
          <h2 className="font-serif text-3xl font-normal text-ink">
            Top Tracks
          </h2>
        </div>
      </div>

      <div className="space-y-1">
        {tracks.map((track, index) => {
          const image = track.album.images?.[0]?.url;

          return (
            <TrackPlayButton
              key={track.id}
              uri={track.uri}
              name={track.name}
              className="track-row group flex items-center gap-4 p-3"
            >
              <span className="w-6 shrink-0 font-mono text-sm text-muted">
                {index + 1}
              </span>

              {image && (
                <Image
                  src={image}
                  alt={track.album.name}
                  width={56}
                  height={56}
                  className="size-14 rounded-lg object-cover"
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">
                  {track.name}
                </p>

                <p className="truncate text-sm text-muted">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>

              <span className="text-sm text-muted transition group-hover:text-muted">
                ▶ Play
              </span>
            </TrackPlayButton>
          );
        })}
      </div>
    </section>
  );
}
