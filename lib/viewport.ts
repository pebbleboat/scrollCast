import type { Viewport } from "./types";

const REMOTE_MAX_WIDTH = 1280;
const REMOTE_MAX_HEIGHT = 720;

/** Lower capture resolution on Render to reduce RAM and ffmpeg encode time. */
export function capViewportForRemote(viewport: Viewport): Viewport {
  if (viewport.width <= REMOTE_MAX_WIDTH && viewport.height <= REMOTE_MAX_HEIGHT) {
    return viewport;
  }

  const scale = Math.min(
    REMOTE_MAX_WIDTH / viewport.width,
    REMOTE_MAX_HEIGHT / viewport.height
  );

  return {
    width: Math.round(viewport.width * scale),
    height: Math.round(viewport.height * scale),
  };
}
