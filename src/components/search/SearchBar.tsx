"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type SearchBarProps = {
  initialQuery?: string;
};

export function SearchBar({
  initialQuery = "",
}: SearchBarProps) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const trimmedQuery = query.trim();

    const timer = window.setTimeout(() => {
      if (!trimmedQuery) {
        router.replace("/search");
        return;
      }

      router.replace(
        `/search?q=${encodeURIComponent(trimmedQuery)}`
      );
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, router]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    router.push(
      `/search?q=${encodeURIComponent(trimmedQuery)}`
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
    >
      <label
        htmlFor="spotify-search"
        className="sr-only"
      >
        Search Spotify
      </label>

      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-500"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
            strokeWidth="2"
          />

          <path
            d="m20 20-3.5-3.5"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <input
          id="spotify-search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search tracks, artists, albums..."
          autoComplete="off"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-4 pl-12 pr-5 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/20 focus:bg-white/[0.08]"
        />
      </div>
    </form>
  );
}
