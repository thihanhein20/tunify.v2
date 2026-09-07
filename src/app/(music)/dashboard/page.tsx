import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TopArtists } from "@/components/dashboard/TopArtists";
import { TopTracks } from "@/components/dashboard/TopTracks";

import { getTopArtists } from "@/lib/spotify/api/artists";
import { getCurrentUserProfile } from "@/lib/spotify/api/profile";
import { hasSpotifySession } from "@/lib/spotify/auth/session";
import { getTopTracks } from "@/lib/spotify/api/tracks";

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
    <main className="min-h-screen bg-paper px-6 py-10 text-ink">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader user={user} />

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <TopTracks tracks={tracks.items} />
          <TopArtists artists={artists.items} />
        </div>
      </div>
    </main>
  );
}
