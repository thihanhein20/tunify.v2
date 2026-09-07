import { NextRequest, NextResponse } from "next/server";

import {
  SpotifyApiError,
  spotifyFetch,
} from "@/lib/spotify/api/client";

export async function PUT(request: NextRequest) {
  const { deviceId } = (await request.json()) as {
    deviceId?: string;
  };

  if (!deviceId) {
    return NextResponse.json(
      { error: "Device ID is required" },
      { status: 400 }
    );
  }

  try {
    await spotifyFetch<void>("/me/player", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false,
      }),
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Unable to transfer playback" },
      { status: 500 }
    );
  }
}
