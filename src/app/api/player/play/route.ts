import { NextRequest, NextResponse } from "next/server";

import {
  SpotifyApiError,
  spotifyFetch,
} from "@/lib/spotify/api/client";

export async function PUT(request: NextRequest) {
  const { deviceId, uri } = (await request.json()) as {
    deviceId?: string;
    uri?: string;
  };

  if (!deviceId || !uri) {
    return NextResponse.json(
      { error: "Device ID and track URI are required" },
      { status: 400 }
    );
  }

  if (!uri.startsWith("spotify:track:")) {
    return NextResponse.json(
      { error: "Invalid Spotify track URI" },
      { status: 400 }
    );
  }

  try {
    await spotifyFetch<void>(
      `/me/player/play?device_id=${encodeURIComponent(
        deviceId
      )}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [uri],
        }),
      }
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to start playback" },
      { status: 500 }
    );
  }
}
