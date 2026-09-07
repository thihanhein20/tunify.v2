import { redirect } from "next/navigation";

import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";

import { hasSpotifySession } from "@/lib/spotify/auth/session";
import { searchSpotify } from "@/lib/spotify/api/search";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const authenticated = await hasSpotifySession();

  if (!authenticated) {
    redirect("/");
  }

  const { q } = await searchParams;

  const query = q?.trim() ?? "";

  const results = query
    ? await searchSpotify(query)
    : null;

  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-ink">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow">
            Follow your curiosity
          </p>

          <h1 className="mb-4 mt-4 font-serif text-5xl font-normal sm:text-6xl">
            Find your next favourite.
          </h1>

          <p className="mt-3 text-muted">
            Search Spotify for tracks, artists,
            albums and playlists.
          </p>

          <div className="mt-8">
            <SearchBar initialQuery={query} />
          </div>
        </div>

        <div className="mt-12">
          {!query ? (
            <div className="py-20">
              <p className="text-muted">
                Start typing to search Spotify.
              </p>
            </div>
          ) : results ? (
            <SearchResults results={results} />
          ) : null}
        </div>
      </div>
    </main>
  );
}
