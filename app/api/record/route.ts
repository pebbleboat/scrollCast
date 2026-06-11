import { NextResponse } from "next/server";
import { isServerless } from "@/lib/browser";
import { startRecording } from "@/lib/startRecording";
import type { ScrollConfig, Viewport } from "@/lib/types";
import { DEFAULT_VIEWPORT } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type RecordBody = {
  pages: string[];
  scrollType: ScrollConfig["type"];
  pixelsPerStep: number;
  intervalMs: number;
  jumpWaitMs: number;
  width?: number;
  height?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RecordBody;
    const pages = body.pages.map((url) => url.trim()).filter(Boolean);

    if (pages.length === 0) {
      return NextResponse.json({ error: "Add at least one URL" }, { status: 400 });
    }

    const scroll: ScrollConfig = {
      type: body.scrollType,
      pixelsPerStep: body.pixelsPerStep,
      intervalMs: body.intervalMs,
      jumpWaitMs: body.jumpWaitMs,
    };

    const viewport: Viewport =
      body.width && body.height
        ? { width: body.width, height: body.height }
        : DEFAULT_VIEWPORT;

    const session = await startRecording({ pages, scroll, viewport });

    if (isServerless()) {
      return NextResponse.json({
        sessionId: session.id,
        status: session.status,
        hasVideo: Boolean(session.videoPath),
        error: session.error,
      });
    }

    return NextResponse.json({ sessionId: session.id, status: session.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start recording";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
