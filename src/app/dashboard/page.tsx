import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TopArtists } from "@/components/dashboard/TopArtists";
import { TopTracks } from "@/components/dashboard/TopTracks";

import { getTopArtists } from "@/lib/spotify/api/artists";
import { getCurrentUserProfile } from "@/lib/spotify/api/profile";
import { hasSpotifySession } from "@/lib/spotify/auth/session";
import { getTopTracks } from "@/lib/spotify/api/tracks";
import { TunifyPlayer } from "@/components/player/TunifyPlayer";
import { SpotifyPlayerProvider } from "@/components/player/SpotifyPlayerProvider";

export default async function DashboardPage() {
  const authenticated = await hasSpotifySession();

  if (!authenticated) {
    redirect("/");
  }

  const [user, tracks, artists] = await Promise.all([
    getCurrentUserProfile(),
    getTopTracks(),
    getTopArtists(),
  ]);

  return (
    <SpotifyPlayerProvider>
      <main className="min-h-screen bg-zinc-950 px-6 pb-28 pt-10 text-white">
        <div className="mx-auto max-w-7xl">
          <DashboardHeader user={user} />

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <TopTracks tracks={tracks.items} />
            <TopArtists artists={artists.items} />
          </div>
        </div>
        <TunifyPlayer />
      </main>
    </SpotifyPlayerProvider>
  );
}
