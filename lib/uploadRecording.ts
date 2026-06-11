import { readFile } from "fs/promises";
import { put } from "@vercel/blob";

export async function uploadRecording(
  id: string,
  videoPath: string
): Promise<string> {
  const data = await readFile(videoPath);
  const blob = await put(`recordings/${id}.webm`, data, {
    access: "public",
    contentType: "video/webm",
  });

  return blob.url;
}
