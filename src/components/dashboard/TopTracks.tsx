import Image from "next/image";

import type { SpotifyTrack } from "@/lib/tunify/track";

type TopTracksProps = {
  tracks: SpotifyTrack[];
};

export function TopTracks({ tracks }: TopTracksProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">Your favourites</p>
          <h2 className="text-2xl font-semibold text-white">
            Top Tracks
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {tracks.map((track, index) => {
          const image = track.album.images?.[0]?.url;

          return (
            <a
              key={track.id}
              href={track.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
            >
              <span className="w-6 text-sm text-zinc-500">
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
                <p className="truncate font-medium text-white">
                  {track.name}
                </p>

                <p className="truncate text-sm text-zinc-500">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>

              <span className="text-sm text-zinc-600 transition group-hover:text-zinc-300">
                Spotify
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
