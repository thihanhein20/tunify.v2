import type { CSSProperties } from "react";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.15fr_1fr] lg:gap-20 lg:py-24">
      <div>
        <p className="eyebrow mb-7">A little more you. A lot more music.</p>
        <h1 className="display-title mb-7">Good music.<br />Great <em className="text-accent">company.</em></h1>
        <p className="mb-9 max-w-md text-lg text-muted">The tracks you come back to. The artists you can’t get enough of. A space for your own kind of listening.</p>
        <a href="/api/auth/login" className="primary-button">Find your rotation <span aria-hidden="true">↗</span></a>
        <p className="mt-4 text-sm text-muted">Bring your Spotify account. Make yourself at home.</p>
      </div>
      <div className="hero-art" aria-label="Abstract sound wave in orange and olive">
        <div className="flex items-center justify-between pl-12 text-xs font-semibold uppercase tracking-[.17em]"><span>The Tunify frequency</span><span>01 / ∞</span></div>
        <div className="frequency" aria-hidden="true">{[18,30,46,63,82,96,72,50,36,58,85,100,79,54,33,20].map((height,index)=><span key={index} style={{"--bar": `${height}%`} as CSSProperties} />)}</div>
        <div className="flex items-end justify-between border-t border-ink/20 pt-5"><p className="m-0 font-serif text-3xl italic">In your element.</p><span className="text-3xl" aria-hidden="true">↗</span></div>
      </div>
    </section>
  );
}
