# Tunify

A Next.js and TypeScript app with Spotify sign-in, a dashboard of top tracks and artists, catalog search, and a web player integration in progress.

## Local setup

1. Install Node.js 22 or newer, then run `npm ci`.
2. Copy `.env.example` to `.env.local` and supply your Spotify app credentials.
3. Register `http://127.0.0.1:3000/api/auth/callback/tunify` as the redirect URI in your Spotify app settings.
4. Run `npm run dev` and open http://127.0.0.1:3000.

Keep the client secret server-side. For hosting, set `APP_URL` to the site's origin and register its matching `/api/auth/callback/tunify` URL. This app requires a Next.js-compatible server, rather than static hosting.

## Project structure

```text
src/
  app/                         Pages, layouts, styles, and HTTP route handlers
    api/
      auth/                    Login, callback, logout, and token refresh
      player/                  Play and transfer playback
      search/                  Catalog search endpoint
    dashboard/
    search/
  components/                  UI grouped by feature
    dashboard/
    landing/
    layout/
    player/                    Player UI, provider, and useSpotifyPlayer hook
    search/
  lib/
    spotify/
      api/                     API client and resource request functions
        client.ts
        artists.ts
        tracks.ts
        profile.ts
        search.ts
      auth/                    OAuth token exchange, cookies, and session helpers
        tokens.ts
        cookies.ts
        session.ts
      types/                   Shared Spotify response and playback SDK types
        index.ts
        playback-sdk.d.ts
      config.ts                Spotify configuration, scopes, and URLs
```

Keep route handlers focused on HTTP input and output. Put Spotify requests in `lib/spotify/api`, authentication helpers in `lib/spotify/auth`, and shared response types in `lib/spotify/types`. Import types with `import type` so UI components do not depend on server request modules. Keep feature-specific hooks beside their components; add a shared hooks folder only when multiple features need one.

Use PascalCase for React component files and match the exported component name. Use descriptive lowercase names for library modules. Add folders and components when they have an implementation, rather than empty placeholders.

The OAuth callback retains the existing `/api/auth/callback/tunify` path so registered redirect URLs remain valid. Playback transfer lives at `/api/player/transfer`.

## Checks

- `npm run lint` — ESLint
- `npx next typegen` — regenerate route types after adding or removing routes
- `npm run typecheck` — TypeScript
- `npm run build` — production build
- `npm run check` — lint, typecheck, and build

Run `npm start` to serve the production build locally.

## Current limitations

Track links still open Spotify; the web player's `playTrack` action is not yet connected to track selection. Playlist pages and recently played UI are not implemented. Live Spotify authentication and playback require manual verification with an authorized account.
