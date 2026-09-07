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
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-400">
            Tunify Search
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Find your music
          </h1>

          <p className="mt-3 text-zinc-500">
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
              <p className="text-zinc-500">
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
