export type ScrollType = "continuous" | "jumpy";
export type SessionStatus = "idle" | "recording" | "done" | "stopped" | "error";

export type ScrollConfig = {
  type: ScrollType;
  pixelsPerStep: number;
  intervalMs: number;
  jumpWaitMs: number;
};

export type RecorderConfig = ScrollConfig & {
  resolutionIndex: number;
};

export type SessionState = {
  id: string | null;
  status: SessionStatus;
  hasVideo: boolean;
  error: string | null;
  isStarting: boolean;
};

export const DEFAULT_SCROLL_CONFIG: ScrollConfig = {
  type: "continuous",
  pixelsPerStep: 12,
  intervalMs: 12,
  jumpWaitMs: 1000,
};

export const DEFAULT_RECORDER_CONFIG: RecorderConfig = {
  ...DEFAULT_SCROLL_CONFIG,
  resolutionIndex: 1,
};

export const INITIAL_SESSION: SessionState = {
  id: null,
  status: "idle",
  hasVideo: false,
  error: null,
  isStarting: false,
};

export const RESOLUTIONS = [
  { label: "1920 × 1080 (Desktop)", width: 1920, height: 1080 },
  { label: "1440 × 900 (Desktop)", width: 1440, height: 900 },
  { label: "1280 × 720 (Tablet)", width: 1280, height: 720 },
  { label: "430 × 932 (Mobile)", width: 430, height: 932 },
  { label: "390 × 844 (Mobile)", width: 390, height: 844 },
] as const;

export const STATUS_LABELS: Record<SessionStatus, string> = {
  idle: "Ready",
  recording: "Recording",
  done: "Complete",
  stopped: "Stopped",
  error: "Error",
};
