# Tunify

A small Next.js + TypeScript Spotify search assessment. **Currently a skeleton:** the landing page runs; authentication and search are proposed, not implemented.

## Run

Use Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The skeleton needs no Spotify credentials.

```sh
npm run check
```

This runs ESLint, TypeScript, and a production build. `npm run build` exports static files to `out/`; deployment needs only a static file host, not a Next.js application server.

## Spotify setup (for the implementation phase)

1. Create an app in the Spotify Developer Dashboard.
2. Register the exact redirect URI `http://127.0.0.1:3000/`.
3. Copy `.env.example` to `.env.local` and enter the client ID. These values are intentionally public; never add a client secret.
4. Add the reviewer's Spotify account to the app's authorised users, or let them configure their own client ID.
5. Restart the development server after changing configuration.

Spotify development mode currently requires the app owner to have Premium and new apps support up to five authorised users. `localhost` is not an allowed redirect URI; use the loopback IP above. A hosted version needs an HTTPS redirect URI and a rebuild with the matching public configuration.

## Proposed design

Use the App Router with static export, client components for interactive behaviour, native `fetch`, React state, and plain CSS. The root layout provides build-time HTML and metadata; no API routes, Server Actions, database, or runtime backend are needed. Browser-only APIs must run in effects or event handlers because Next.js still prerenders client components during the build.

Proposed files, added only when needed:

```text
src/
  app/
    layout.tsx           # HTML shell and metadata (exists)
    page.tsx             # Page composition (placeholder exists)
    globals.css          # Shared styles (exists)
  components/
    search-form.tsx      # Labelled input, type selector, submit
    search-results.tsx   # Artist/track list and empty state
  hooks/
    use-spotify.ts       # Session and authentication lifecycle
    use-search.ts        # Search state and cancellation
  lib/spotify/
    auth.ts              # PKCE, callback validation, token refresh
    api.ts               # Typed search request and HTTP errors
    types.ts             # Only response fields the UI uses
```

Keep session state in the page through a hook and pass values to children. No global state library, Spotify SDK, or general-purpose API abstraction is necessary. Separate protocol logic from rendering so both remain explainable and testable.

## Authentication proposal

Use Authorization Code with PKCE (S256). Client Credentials requires a secret and is unsuitable for a browser-only application; do not use the deprecated implicit flow.

1. Generate a random verifier and independent OAuth state using Web Crypto. Save them temporarily in sessionStorage and redirect to Spotify with the hashed challenge.
2. Return to the same root page; read the callback URL in a client effect. Handle denied consent and validate the returned state against the saved value before exchanging the code.
3. Exchange the code directly with Spotify using the verifier and public client ID. Ensure callback processing is single-flight, including during React development effect replay.
4. Remove callback parameters from the URL and clear temporary state/verifier after processing. Request no additional user-data scopes for catalog search.
5. Keep tokens and expiry in tab-scoped sessionStorage for reload continuity. Refresh before expiry; on a 401 refresh and retry at most once. Deduplicate refreshes, replace rotated refresh tokens, and return to sign-in if refresh fails.
6. Disconnect clears this app's local session; it does not log the user out of Spotify globally.

sessionStorage is readable by JavaScript, so it is a pragmatic persistence choice, not protection against XSS. Avoid raw HTML insertion and unnecessary third-party scripts. Memory-only tokens would reduce persistence but require sign-in after reload. A backend with HttpOnly cookies would change the client-only requirement.

## Minimum submission

- Spotify connect/disconnect.
- One labelled search field, Artists/Songs selector, Enter/button submission, and whitespace validation.
- Up to 10 results per request: image, artist or song name, track artist/album where applicable, and a link back to Spotify. Preserve API ordering and handle absent images.
- Responsive layout, visible keyboard focus, accessible status announcements, and helpful recoverable errors.
- Clear setup instructions and a short explanation of AI-assisted work and the design decisions understood by the author.

“Favourite” is interpreted as music the user wants to find; saved favourites, playlists, playback, infinite scrolling, and recommendation features are outside the proposed scope. Optional pagination can come later. Explicit submission saves quota and is simpler than debounced autocomplete.

## States and request behaviour

| State | Behaviour |
| --- | --- |
| Missing configuration | Explain which public configuration is missing |
| Disconnected / connecting | Sign-in action / progress; prevent duplicate actions |
| Consent denied or invalid callback | Explain failure and offer a fresh sign-in |
| Ready, no search yet | Prompt the user to search |
| Blank query | Inline validation; no request |
| Searching | Announce loading; prevent duplicate submissions |
| Success / zero results | Show list / suggest another spelling or query |
| Network or 5xx error | Preserve input and offer retry |
| Expired session | Refresh once; reconnect if unsuccessful |
| 403 | Explain possible development-mode account access issue |
| 429 | Honour Retry-After when supplied; no automatic retry loop |
| Missing artwork | Stable visual placeholder |

Cancel superseded requests with AbortController and ignore stale completions. Cancellation is not a user-visible failure. Keep results associated with the submitted query and type rather than the text currently being edited.

## Testing proposal

For the skeleton, lint, typecheck, and static build are enough. Add Vitest when real logic exists; mock native fetch directly rather than adding a network mocking library initially.

Prioritise PKCE challenge generation against a known vector, rejected callback state, one-time callback processing, token refresh/retry boundaries, URL encoding, blank input, stale requests, and 429 handling. Add React Testing Library and a DOM environment only for a small set of behavioural UI tests (submit, loading, results, empty and error/retry). Avoid snapshot-heavy or implementation-mirroring tests.

Manually verify the real Spotify login, consent denial, reload, disconnect, keyboard navigation, mobile layout, missing images, and an authorised reviewer account. Automated tests should use fixtures, not real tokens or live Spotify requests. A full browser test framework is optional for this scope.

## References

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [Spotify PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [Spotify redirect URIs](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri)
- [Spotify development-mode changes and search limits](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide)

Design reviewed against official documentation on 7 September 2026.
