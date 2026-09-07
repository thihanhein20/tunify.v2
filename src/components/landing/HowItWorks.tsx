const steps = [
  {title: "Bring your music", description: "Connect your Spotify account."},
  {title: "Find your favourites", description: "Explore your top tracks and artists."},
  {title: "Make time to listen", description: "Pick a track. Let it play."},
];
export function HowItWorks() {
  return <section id="how-it-works" className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2"><div><p className="eyebrow mb-5">Make yourself at home</p><h2 className="max-w-md font-serif text-5xl font-normal">Your next listening<br /><em className="text-accent">ritual.</em></h2></div><div>{steps.map((step,index)=><div key={step.title} className="flex gap-6 border-b border-line py-5"><span className="pt-1 text-sm text-accent">0{index+1}</span><div><h3 className="mb-1 text-lg font-semibold">{step.title}</h3><p className="mb-0 text-muted">{step.description}</p></div></div>)}</div></section>;
}
