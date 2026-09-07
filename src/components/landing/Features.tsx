const features = [
  {
    title: "Your top music",
    description:
      "See the artists and tracks that define your listening habits.",
  },
  {
    title: "Playlist discovery",
    description:
      "Explore your Spotify playlists through a cleaner and more focused interface.",
  },
  {
    title: "Listening insights",
    description:
      "Turn your Spotify activity into meaningful insights about your music taste.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="border-t border-white/10 py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-green-400">
            Features
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            Your Spotify, made easier to understand.
          </h2>

          <p className="mt-5 text-lg text-zinc-400">
            Tunify gives you a focused view of the music you already
            love.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-7"
            >
              <div className="mb-6 h-10 w-10 rounded-xl bg-green-400/10" />

              <h3 className="text-xl font-medium">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-zinc-400">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
