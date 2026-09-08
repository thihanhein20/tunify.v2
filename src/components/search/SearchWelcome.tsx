import { ConnectSpotify } from "@/components/auth/SpotifySession";

const examples = ["Fleetwood Mac", "Daft Punk", "Here Comes the Sun"];
const bars = [12, 22, 34, 52, 38, 64, 46, 28, 40, 56, 32, 18, 10];

type SearchWelcomeProps = {
  connected: boolean;
  onSelect: (query: string) => void;
};

export function SearchWelcome({ connected, onSelect }: SearchWelcomeProps) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl bg-[#e9ecdf]/60 px-5 py-10 text-center sm:mt-12 sm:py-12">
      <svg
        aria-hidden="true"
        viewBox="0 0 208 80"
        className="mb-6 h-16 w-44 text-accent/70"
        fill="currentColor"
      >
        {bars.map((height, index) => (
          <rect key={index} x={index * 16 + 4} y={(80 - height) / 2} width="7" height={height} rx="3.5" />
        ))}
      </svg>
      <h2 className="mb-3 font-serif text-3xl sm:text-4xl">
        Your next favourite starts here.
      </h2>
      <p className="mb-6 max-w-md text-muted">
        {connected
          ? "An old favourite or something new. Where will you start?"
          : "Connect Spotify, then search for a song or artist."}
      </p>
      {connected ? (
        <div>
          <p className="mb-3 text-sm font-medium text-muted">Try a search</p>
          <div className="flex flex-wrap justify-center gap-2">
            {examples.map(example => (
              <button
                key={example}
                type="button"
                onClick={() => onSelect(example)}
                className="rounded-full bg-surface px-5 py-3 text-sm text-ink transition-colors hover:bg-accent hover:text-white"
              >
                {example} <span aria-hidden="true" className="ml-2">↗</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <ConnectSpotify />
          <div className="mt-6 flex max-w-sm items-start gap-3 rounded-xl bg-surface/70 px-4 py-3 text-left">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-5 shrink-0 text-accent">
              <rect x="5" y="10" width="14" height="11" rx="3" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
            </svg>
            <p className="m-0 text-sm leading-relaxed text-muted">
              <span className="block font-medium text-ink">Spotify sign-in is required to search.</span>
              Tunify only searches songs and artists—it won’t change your library.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
