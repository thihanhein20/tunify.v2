export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-7 text-sm text-muted">
        <p className="m-0">© {new Date().getFullYear()} Tunify</p>
        <p className="m-0">Made for the way you listen. <span className="ml-3 text-accent">↗</span></p>
      </div>
    </footer>
  );
}
