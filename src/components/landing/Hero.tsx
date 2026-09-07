export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex min-h-[720px] max-w-7xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400">
          Your music. Your listening story.
        </div>

        <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
          Discover what your
          <span className="block text-green-400">
            Spotify says about you.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          Tunify turns your Spotify listening data into a cleaner,
          smarter way to explore your favourite tracks, artists and
          playlists.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/api/auth/login"
            className="rounded-full bg-green-400 px-7 py-3.5 font-semibold text-black transition hover:bg-green-300"
          >
            Connect Spotify
          </a>

          <a
            href="#features"
            className="rounded-full border border-white/10 px-7 py-3.5 font-medium text-white transition hover:bg-white/5"
          >
            Explore features
          </a>
        </div>

        <p className="mt-5 text-sm text-zinc-500">
          Secure authentication through Spotify.
        </p>

        <div className="mt-16 w-full max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <PreviewCard
                label="Top Artist"
                value="Your favourite artist"
              />

              <PreviewCard
                label="Top Track"
                value="Your most played track"
              />

              <PreviewCard
                label="Listening"
                value="Your music insights"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type PreviewCardProps = {
  label: string;
  value: string;
};

function PreviewCard({
  label,
  value,
}: PreviewCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-3 font-medium text-zinc-200">
        {value}
      </p>

      <div className="mt-6 h-2 rounded-full bg-white/10">
        <div className="h-2 w-2/3 rounded-full bg-green-400" />
      </div>
    </div>
  );
}
