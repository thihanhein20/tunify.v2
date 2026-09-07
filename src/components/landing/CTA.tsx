export function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.04] px-8 py-16 text-center">
        <h2 className="text-4xl font-semibold tracking-tight">
          See your music differently.
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
          Connect your Spotify account and start exploring your
          listening habits with Tunify.
        </p>

        <a
          href="/api/auth/login"
          className="mt-8 inline-block rounded-full bg-green-400 px-7 py-3.5 font-semibold text-black transition hover:bg-green-300"
        >
          Get started
        </a>
      </div>
    </section>
  );
}
