import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = getSession(id);

  if (!session?.videoPath) {
    return NextResponse.json({ error: "Video not ready" }, { status: 404 });
  }

  const video = await readFile(session.videoPath);

  return new NextResponse(video, {
    headers: {
      "Content-Type": "video/webm",
      "Content-Disposition": `attachment; filename="walkthrough-${id}.webm"`,
    },
  });
}
