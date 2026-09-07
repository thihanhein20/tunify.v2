import Image from "next/image";

import type { SpotifyUserProfile } from "@/types/tunify";

type DashboardHeaderProps = {
  user: SpotifyUserProfile;
};

export function DashboardHeader({
  user,
}: DashboardHeaderProps) {
  const avatar = user.images?.[0]?.url;

  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-400">
          Dashboard
        </p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Welcome back
          {user.display_name
            ? `, ${user.display_name}`
            : ""}
        </h1>

        <p className="mt-3 text-zinc-400">
          Here&apos;s what you&apos;ve been listening to.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {avatar ? (
          <Image
            src={avatar}
            alt={
              user.display_name
                ? `${user.display_name}'s Spotify profile`
                : "Spotify profile"
            }
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-12 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
            {user.display_name
              ?.charAt(0)
              .toUpperCase() ?? "S"}
          </div>
        )}

        <div className="hidden sm:block">
          <p className="text-sm font-medium text-white">
            {user.display_name ?? "Spotify User"}
          </p>

          {user.email && (
            <p className="text-xs text-zinc-500">
              {user.email}
            </p>
          )}
        </div>

        <a
          href="/api/auth/logout"
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
        >
          Log out
        </a>
      </div>
    </header>
  );
}
