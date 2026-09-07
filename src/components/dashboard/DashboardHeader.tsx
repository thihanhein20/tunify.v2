import Image from "next/image";
import Link from "next/link";
import type { SpotifyUserProfile } from "@/lib/spotify/types";

export function DashboardHeader({ user }: { user: SpotifyUserProfile }) {
  const avatar = user.images?.[0]?.url;
  return (
    <header className="flex flex-col justify-between gap-8 border-b border-line pb-9 md:flex-row md:items-end">
      <div>
        <p className="eyebrow mb-4">Your personal soundtrack</p>
        <h1 className="mb-4 font-serif text-5xl font-normal sm:text-6xl">In good <em className="text-accent">rotation.</em></h1>
        <p className="mb-0 text-muted">Welcome back{user.display_name ? `, ${user.display_name}` : ""}. Pick up with a favourite.</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {avatar ? <Image src={avatar} alt="Your profile" width={44} height={44} className="size-11 rounded-full object-cover" /> : <span className="flex size-11 items-center justify-center rounded-full bg-line font-semibold">{user.display_name?.charAt(0).toUpperCase() || "T"}</span>}
        <Link href="/search" className="primary-button">Find something new ↗</Link>
        <a href="/api/auth/logout" className="text-sm text-muted underline underline-offset-4 hover:text-accent">Log out</a>
      </div>
    </header>
  );
}
