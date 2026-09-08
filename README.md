# Tunify

A client-only Spotify song and artist search app built with Next.js, React, TypeScript, and Tailwind CSS. The site exports to static files: authentication and search run in the browser and call Spotify directly. No app backend, database, or client secret is required.

## Run locally

1. Install Node.js 22 or newer.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and enter your Spotify app's **client ID**.
4. Register **`http://127.0.0.1:3000/`** as the redirect URI in the Spotify Developer Dashboard. The root page completes PKCE in the browser. Add the reviewer's account to the app's authorized users if required by your app's development-mode settings.
5. Run `npm run dev` and open http://127.0.0.1:3000.
6. Select **Connect Spotify**, approve access, and search for a song or artist.

```dotenv
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/
```

Both settings are public. Never put a client secret in a `NEXT_PUBLIC_` variable. The old `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_CLIENT_ID`, and `APP_URL` variables are no longer used. Restart development or rebuild after changing configuration. For hosting, set an HTTPS root redirect URI matching the hosted site and register that exact URL with Spotify.

## Check and preview

```sh
npm run check
npm start
```

`check` runs lint, TypeScript, mocked protocol tests, and the production build. `npm start` serves the generated `out/` directory at http://127.0.0.1:3000; stop the development server first to free that port. The preview server only serves static files and is not an application backend. Deploy the contents of `out/` to a static host.

Individual checks: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. The build uses Next.js's webpack option because Turbopack's local port requirements were blocked in the development environment.

## How it works

- **Login:** Tunify checks that the current origin matches the configured redirect origin before creating PKCE data. Returning via browser Back resets the connecting controls and rechecks the session. The browser creates a random verifier and OAuth state, hashes the verifier using SHA-256, and sends the challenge to Spotify. After redirect, it validates state and exchanges the code using the verifier and public client ID. Callback exchange is shared during React effect replay.
- **Session:** tokens live in tab-scoped `sessionStorage` for reload continuity. This storage is JavaScript-readable, not equivalent to HTTP-only cookies. Logout clears Tunify's session; it does not log the user out of Spotify itself. Expiring tokens are refreshed once per concurrent batch; rotated refresh tokens are saved. Logout prevents an in-flight refresh from restoring the session.
- **Search:** after 350 ms without typing, the browser requests up to ten songs and ten artists. Superseded requests are aborted and stale results ignored. The market is currently Australia (`AU`). No personal-data scopes are requested.
- **Errors:** loading and empty states are visible. Login and search failures use accessible inline alerts with reconnect or retry actions. Requests time out after 15 seconds, including response-body reads. Token-endpoint rate limits enforce a cooldown using `Retry-After`. Temporary refresh failures preserve the session; rejected refresh credentials clear it and prompt reconnection. A 401 triggers one refresh/retry, a 403 explains account access, and a 429 respects `Retry-After` before allowing another request.
- **Listening:** results link to Spotify. Playback, saved favourites, personal dashboards, and playlist search are outside this focused submission.

## Structure

```text
src/
  app/                       Static page, layout, and shared styles
  components/
    auth/SpotifySession.tsx  Browser session context and connect button
    search/SearchBar.tsx     Debounced input and request lifecycle
    search/SearchResults.tsx Song and artist results
    layout/                  Navigation and footer
  lib/spotify/
    auth/session.ts          PKCE, session storage, callback, refresh, logout
    api/search.ts            Direct Spotify search and HTTP errors
    config.ts                Public configuration
    types/index.ts           API response types
scripts/preview.mjs           Local static-file preview
tests/spotify.test.mjs       Mocked protocol checks
```

## Before submitting

Manually verify login, denied consent, search, no results, logout, reload, keyboard navigation, mobile layout, and the reviewer's authorized account. Automated tests do not call live Spotify or prove account eligibility.

Provide the actual AI conversation export alongside the repository, with credentials and personal information removed. This README is a design explanation, not a substitute for the requested AI transcript. AI assisted with implementation and refactoring; review the code and describe the decisions you understand in your own submission.

## References

- [Spotify PKCE flow](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [Refreshing Spotify tokens](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens)
- [Spotify search](https://developer.spotify.com/documentation/web-api/reference/search)
