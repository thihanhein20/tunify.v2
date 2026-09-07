import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getCurrentUserProfile } from "@/lib/tunify/profile";
import { hasSpotifySession } from "@/lib/tunify/session";

export default async function DashboardPage() {
  const authenticated = await hasSpotifySession();

  if (!authenticated) {
    redirect("http://127.0.0.1:3000/");
  }

  const user = await getCurrentUserProfile();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader user={user} />

        <section className="mt-12">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <p className="text-sm text-zinc-500">
              Spotify connected
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Your Tunify dashboard is ready.
            </h2>
          </div>
        </section>
      </div>
    </main>
  );
}
