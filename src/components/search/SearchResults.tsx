import Image from "next/image";

import type {
  SpotifySearchResponse,
  SpotifySearchTrack,
} from "@/lib/spotify/types";

type SearchResultsProps = {
  results: SpotifySearchResponse;
};

function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60_000);

  const seconds = Math.floor(
    (duration % 60_000) / 1000
  );

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function SearchResults({
  results,
}: SearchResultsProps) {
  const tracks = results.tracks?.items ?? [];
  const artists = results.artists?.items ?? [];
  const hasResults = tracks.length > 0 || artists.length > 0;

  if (!hasResults) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted">
          No results found.
        </p>

        <p className="mt-2 text-sm text-muted">
          Try another artist or song.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      {tracks.length > 0 && (
        <section>
          <h2 className="mb-5 font-serif text-3xl font-normal">
            Tracks
          </h2>

          <div className="space-y-2">
            {tracks.map((track, index) => (
              <TrackResult
                key={track.id}
                track={track}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {artists.length > 0 && (
        <section>
          <h2 className="mb-5 font-serif text-3xl font-normal">
            Artists
          </h2>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {artists.map((artist) => {
              const image =
                artist.images?.[0]?.url;

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
                      loading="eager"
                      className="aspect-square w-full rounded-lg object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="aspect-square w-full rounded-lg bg-line" />
                  )}

                  <p className="mt-4 truncate font-medium text-ink">
                    {artist.name}
                  </p>

                  <p className="text-sm text-muted">
                    Artist
                  </p>
                </a>
              );
            })}
          </div>
        </section>
      )}


    </div>
  );
}

function TrackResult({
  track,
  index,
}: {
  track: SpotifySearchTrack;
  index: number;
}) {
  const image = track.album.images?.[0]?.url;

  return (
    <a
      href={track.external_urls.spotify}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${track.name} in Spotify (new tab)`}
      className="track-row group flex items-center gap-4 px-3 py-3"
    >
      <span className="w-5 text-sm text-muted">
        {index + 1}
      </span>

      {image ? (
        <Image
          src={image}
          alt={track.album.name}
          width={52}
          height={52}
          className="size-13 rounded-md object-cover"
        />
      ) : (
        <div className="size-13 rounded-md bg-line" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">
          {track.name}
        </p>

        <p className="truncate text-sm text-muted">
          {track.artists
            .map((artist) => artist.name)
            .join(", ")}
        </p>
      </div>

      <span className="hidden text-sm text-muted sm:block">
        {track.album.name}
      </span>

      <span className="w-12 text-right text-sm text-muted">
        {formatDuration(track.duration_ms)}
      </span>
    </a>
  );
}
