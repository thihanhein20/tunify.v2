const features = [
  {title: "Always on repeat.", description: "Revisit the tracks that feel like you, with your top music together in one place."},
  {title: "Follow your curiosity.", description: "Find a song, explore an artist, or rediscover an album you haven’t heard in a while."},
  {title: "Stay for another song.", description: "Choose a track and settle into your listening session with the Tunify web player."},
];
export function Features() {
  return (
    <section id="features" className="border-y border-line bg-surface py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="eyebrow mb-10">Less noise. More of what you love.</p>
        <div className="grid gap-10 md:grid-cols-3">{features.map((feature,index)=><article key={feature.title} className="border-t border-line pt-6"><span className="section-number">0{index+1}</span><h2 className="mb-3 mt-5 font-serif text-3xl font-normal">{feature.title}</h2><p className="mb-0 max-w-sm text-muted">{feature.description}</p></article>)}</div>
      </div>
    </section>
  );
}
