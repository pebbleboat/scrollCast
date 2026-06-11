export type ScrollType = "continuous" | "jumpy";

export type ScrollConfig = {
  type: ScrollType;
  pixelsPerStep: number;
  intervalMs: number;
  jumpWaitMs: number;
};

export type Viewport = {
  width: number;
  height: number;
};

export type RecordOptions = {
  pages: string[];
  scroll: ScrollConfig;
  viewport?: Viewport;
  outputDir: string;
  headless?: boolean;
  signal?: AbortSignal;
};

export const DEFAULT_SCROLL: ScrollConfig = {
  type: "continuous",
  pixelsPerStep: 12,
  intervalMs: 8,
  jumpWaitMs: 1000,
};

export const DEFAULT_VIEWPORT: Viewport = {
  width: 430,
  height: 932,
};
