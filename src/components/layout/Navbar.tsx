import Link from "next/link";
import { hasSpotifySession } from "@/lib/spotify/auth/session";

export async function Navbar() {
  const connected = await hasSpotifySession();
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex min-h-22 max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href={connected ? "/dashboard" : "/"} className="brand" aria-label="Tunify home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>tunify<span className="text-accent">.</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm font-medium sm:gap-9">
          {connected ? <><Link href="/dashboard" className="hover:text-accent">Your rotation</Link><Link href="/search" className="hover:text-accent">Discover ↗</Link></> : <><Link href="/#features" className="hidden hover:text-accent sm:block">The experience</Link><a href="/api/auth/login" className="primary-button">Connect Spotify <span aria-hidden="true">↗</span></a></>}
        </nav>
      </div>
    </header>
  );
}
