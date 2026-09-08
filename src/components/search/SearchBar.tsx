"use client";

import { useEffect, useRef, useState } from "react";
import { useSpotifySession } from "@/components/auth/SpotifySession";
import { searchSpotify } from "@/lib/spotify/api/search";
import type { SpotifySearchResponse } from "@/lib/spotify/types";
import { SearchResults } from "./SearchResults";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { SearchWelcome } from "./SearchWelcome";

export function SearchBar() {
  const { connected, ready, error: authError, connect, connecting } = useSpotifySession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ query: string; data: SpotifySearchResponse } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const trimmed = query.trim();

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (!connected || !trimmed) { setResult(null); setLoading(false); setError(""); return; }
      setLoading(true); setError("");
      try {
        const data = await searchSpotify(trimmed, controller.signal);
        if (!controller.signal.aborted) setResult({ query: trimmed, data });
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult(null);
          setError(error instanceof Error ? error.message : "Unable to search. Please try again.");
        }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [trimmed, connected, retry]);

  return <section id="search" aria-label="Search music" className="mx-auto max-w-7xl px-6 py-10">
    <h1 className="mb-6 font-serif text-4xl">Find your next favourite.</h1>
    <form
      role="search"
      className="w-full"
      onSubmit={event => { event.preventDefault(); setRetry(value => value + 1); }}
    >
      <label htmlFor="spotify-search" className="mb-3 block text-sm font-medium text-muted">
        Search songs and artists
      </label>
      <div className="flex items-center gap-3 rounded-xl bg-surface px-4 shadow-[0_2px_12px_rgba(37,40,32,0.05)] ring-1 ring-ink/10 transition-shadow focus-within:ring-accent/40 sm:gap-4 sm:px-6">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="size-6 shrink-0 text-accent">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input
          ref={inputRef}
          id="spotify-search"
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          maxLength={100}
          placeholder="A favourite band, a song you love…"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-5 text-base text-ink outline-none placeholder:text-muted focus-visible:outline-none sm:py-6 sm:text-lg"
        />
        <button type="submit" aria-label="Search Spotify" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent/90">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </form>
    {authError && (
      <div className="mt-6">
        <ErrorAlert title="Let’s reconnect to Spotify" message={authError} actionLabel={connecting ? "Connecting…" : "Connect Spotify"} onAction={connect} disabled={connecting || !ready} />
      </div>
    )}
    {!ready ? (
      <p role="status" className="mt-4 text-muted">Getting ready…</p>
    ) : !connected || !trimmed ? (
      <SearchWelcome
        connected={connected}
        onSelect={value => {
          setQuery(value);
          inputRef.current?.focus();
        }}
      />
    ) : (
      <div className="mt-8" aria-busy={loading}>
        <p role="status" className="text-sm text-muted">{loading ? "Searching Spotify…" : ""}</p>
        {error ? (
          <ErrorAlert title="We couldn’t load your results" message={error} actionLabel={loading ? "Retrying…" : "Try again"} onAction={() => setRetry(value => value + 1)} disabled={loading} />
        ) : result?.query === trimmed ? <SearchResults results={result.data} /> : null}
      </div>
    )}
  </section>;
}
