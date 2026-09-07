import Image from "next/image";

import type { SpotifyArtist } from "@/lib/spotify/types";

type TopArtistsProps = {
  artists: SpotifyArtist[];
};

export function TopArtists({ artists }: TopArtistsProps) {
  return (
    <section className="music-panel min-w-0">
      <div className="mb-4">
        <p className="eyebrow">
          The people behind the sound
        </p>

        <h2 className="font-serif text-3xl font-normal text-ink">
          Top Artists
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {artists.map((artist) => {
          const image = artist.images?.[0]?.url;

          return (
            <a
              key={artist.id}
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="group min-w-0"
            >
              {image ? (
                <Image
                  src={image}
                  alt={artist.name}
                  width={300}
                  height={300}
                  className="aspect-[4/5] w-full rounded-md object-cover transition duration-300 group-hover:rounded-3xl"
                />
              ) : <div className="flex aspect-[4/5] items-center justify-center rounded-md bg-line font-serif text-5xl" aria-hidden="true">{artist.name.charAt(0)}</div>}

              <p className="mt-3 truncate font-medium text-ink">
                {artist.name}
              </p>

              <p className="mt-1 text-sm text-muted">
                Artist ↗
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
