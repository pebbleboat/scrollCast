import { NextResponse } from "next/server";
import path from "path";
import { startSession } from "@/lib/sessions";
import type { ScrollConfig, Viewport } from "@/lib/types";
import { DEFAULT_VIEWPORT } from "@/lib/types";

export const runtime = "nodejs";

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

  const baseDir = path.resolve(process.cwd(), "videos", "sessions");
  const session = await startSession({ pages, scroll, viewport, baseDir });

  return NextResponse.json({ sessionId: session.id, status: session.status });
}
