import Image from "next/image";

import type { SpotifyArtist } from "@/lib/tunify/artists";

type TopArtistsProps = {
  artists: SpotifyArtist[];
};

export function TopArtists({ artists }: TopArtistsProps) {
  return (
    <section className="min-w-0">
      <div className="mb-4">
        <p className="text-sm text-zinc-500">
          Most played
        </p>

        <h2 className="text-2xl font-semibold text-white">
          Top Artists
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {artists.map((artist) => {
          const image = artist.images?.[0]?.url;

          return (
            <a
              key={artist.id}
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="group min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
            >
              {image && (
                <Image
                  src={image}
                  alt={artist.name}
                  width={300}
                  height={300}
                  className="aspect-square w-full rounded-xl object-cover"
                />
              )}

              <p className="mt-3 truncate font-medium text-white">
                {artist.name}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Artist
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
