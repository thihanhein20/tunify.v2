"use client";

import Link from "next/link";
import { useSpotifySession, ConnectSpotify } from "@/components/auth/SpotifySession";

export function Navbar() {
  const { connected, disconnect } = useSpotifySession();
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex min-h-22 max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="brand" aria-label="Tunify home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>tunify<span className="text-accent">.</span>
        </Link>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-4 text-sm font-medium sm:gap-9">
          {connected ? (
            <>
              <Link href="/#search" className="hover:text-accent">Discover ↗</Link>
              <button onClick={disconnect} className="secondary-button">Log out</button>
            </>
          ) : (
            <>
              <ConnectSpotify />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
