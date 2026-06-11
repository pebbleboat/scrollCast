import { NextResponse } from "next/server";
import { getSession, stopSession } from "@/lib/sessions";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await getSession(id);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: session.status,
    error: session.error,
    hasVideo: Boolean(session.videoUrl ?? session.videoPath),
    videoUrl: session.videoUrl,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await stopSession(id);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ status: session.status });
}
