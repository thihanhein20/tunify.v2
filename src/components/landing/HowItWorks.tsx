const steps = [
  {
    number: "01",
    title: "Connect",
    description:
      "Sign in securely using your Spotify account.",
  },
  {
    number: "02",
    title: "Analyse",
    description:
      "Tunify reads the Spotify data you give permission to access.",
  },
  {
    number: "03",
    title: "Explore",
    description:
      "Discover your top music, playlists and listening insights.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-white/10 py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-green-400">
            How it works
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            Three steps. That&apos;s it.
          </h2>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="text-center"
            >
              <span className="text-sm font-medium text-green-400">
                {step.number}
              </span>

              <h3 className="mt-4 text-2xl font-medium">
                {step.title}
              </h3>

              <p className="mx-auto mt-3 max-w-sm leading-7 text-zinc-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
