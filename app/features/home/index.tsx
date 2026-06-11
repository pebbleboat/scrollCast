"use client";

import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import PreviewWindow from "../../components/PreviewWindow";
import Button from "../../shared/Button";
import Card from "../../shared/Card";
import InputField from "../../shared/InputField";
import Slider from "../../shared/Slider";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronsDownIcon,
  CloseIcon,
  DownloadIcon,
  DragHandleIcon,
  ErrorIcon,
  LinkIcon,
  ScrollIcon,
  StopIcon,
  VideoIcon,
} from "@/utils/svgs";
import { useHook } from "./useHook";

export default function Home() {
  const {
    urls,
    config,
    updateConfig,
    sessionId,
    status,
    error,
    isStarting,
    isRecording,
    isDisabled,
    resolution,
    canDownload,
    downloadUrl,
    previewUrl,
    updateUrl,
    addUrl,
    removeUrl,
    startRecording,
    stopRecording,
  } = useHook();

  const previewContent = () => {
    if (status === "error") {
      return (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <ErrorIcon />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-white">Recording failed</h2>
          <p className="mt-1.5 max-w-sm text-sm text-zinc-400">
            {error ?? "Something went wrong. Please try again."}
          </p>
        </>
      );
    }

    if (isRecording || isStarting) {
      return (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <span className="recording-dot h-5 w-5 rounded-full bg-red-500" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-white">
            {isStarting ? "Setting things up…" : "Recording in progress"}
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-zinc-400">
            {isStarting
              ? "Spinning up a browser to capture your pages. This only takes a moment."
              : "Sit tight — ScrollCast is scrolling through your pages and rendering the video. Keep this tab open."}
          </p>
        </>
      );
    }

    if (canDownload && downloadUrl) {
      return (
        <div className="flex w-full flex-col items-center">
          <video
            src={downloadUrl}
            controls
            autoPlay
            muted
            loop
            playsInline
            className="max-h-[320px] w-auto max-w-full rounded-xl border border-[#2a2a33] bg-black shadow-2xl"
          />
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
            <CheckIcon />
            Recording complete — preview above, download on the right.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
          <VideoIcon />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-white">Ready to capture</h2>
        <p className="mt-1.5 max-w-sm text-sm text-zinc-400">
          Add your pages and hit record. ScrollCast captures a smooth, high-FPS
          scroll-through and renders it into a downloadable video.
        </p>
      </>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar status={status} />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-6">
        <PreviewWindow
          previewUrl={previewUrl}
          resolutionIndex={config.resolutionIndex}
          onResolutionChange={(index) => updateConfig({ resolutionIndex: index })}
          disabled={isDisabled}
        >
          {previewContent()}
        </PreviewWindow>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card
              title="Pages to Record"
              icon={<LinkIcon />}
              action={
                <Button
                  variant="ghost"
                  onClick={addUrl}
                  disabled={isDisabled}
                  className="px-3 py-1.5 text-xs"
                >
                  <span className="text-sm leading-none">+</span> Add Page
                </Button>
              }
            >
              <div className="flex flex-col gap-2">
                {urls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-[#23232b] bg-[#16161c] px-3 py-2.5"
                  >
                    <span className="text-zinc-600">
                      <DragHandleIcon />
                    </span>
                    <InputField
                      placeholder="https://yoursite.com/page"
                      value={url}
                      onChange={(event) => updateUrl(index, event.target.value)}
                      disabled={isDisabled}
                    />
                    {urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrl(index)}
                        disabled={isDisabled}
                        className="text-zinc-600 transition hover:text-red-400 disabled:opacity-50"
                        aria-label="Remove page"
                      >
                        <CloseIcon />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Scroll Behavior" icon={<ScrollIcon />}>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      value: "continuous" as const,
                      label: "Continuous",
                      desc: "Silky smooth motion, ideal for cinematic showcase videos.",
                    },
                    {
                      value: "jumpy" as const,
                      label: "Jumpy",
                      desc: "Step-based navigation. Captures key sections of the page.",
                    },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateConfig({ type: option.value })}
                    disabled={isDisabled}
                    className={`rounded-lg border p-4 text-left transition disabled:opacity-50 ${
                      config.type === option.value
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-[#23232b] bg-[#16161c] hover:border-[#34343f]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={config.type === option.value ? "text-indigo-400" : "text-zinc-500"}>
                        {option.value === "continuous" ? (
                          <ArrowDownIcon />
                        ) : (
                          <ChevronsDownIcon />
                        )}
                      </span>
                      <p className="text-sm font-semibold text-white">{option.label}</p>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{option.desc}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-5">
                {config.type === "continuous" ? (
                  <>
                    <Slider
                      label="Scroll Distance"
                      value={config.pixelsPerStep}
                      displayValue={`${config.pixelsPerStep}px`}
                      min={1}
                      max={30}
                      disabled={isDisabled}
                      onChange={(pixelsPerStep) => updateConfig({ pixelsPerStep })}
                    />
                    <Slider
                      label="Scroll Speed"
                      value={config.intervalMs}
                      displayValue={`${config.intervalMs}ms`}
                      min={4}
                      max={40}
                      disabled={isDisabled}
                      onChange={(intervalMs) => updateConfig({ intervalMs })}
                    />
                  </>
                ) : (
                  <Slider
                    label="Pause Between Jumps"
                    value={config.jumpWaitMs}
                    displayValue={`${config.jumpWaitMs}ms`}
                    min={300}
                    max={3000}
                    step={100}
                    disabled={isDisabled}
                    onChange={(jumpWaitMs) => updateConfig({ jumpWaitMs })}
                  />
                )}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={startRecording}
                  disabled={isDisabled}
                  className="w-full"
                >
                  {isStarting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Starting…
                    </>
                  ) : (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                      Start Recording
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="w-full disabled:opacity-40"
                >
                  <StopIcon />
                  Stop &amp; Finish
                </Button>
              </div>

              <div className="my-5 h-px bg-[#1e1e25]" />

              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                How it works
              </h3>
              <ol className="mt-4 space-y-3">
                {[
                  "Enter your list of URLs to be captured in order.",
                  "Configure speed and distance for the auto-scroll engine.",
                  "Hit record. ScrollCast captures a high-FPS scroll-through video.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-400">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-[11px] font-semibold text-indigo-400">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </Card>

            <Card>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Recent Recordings
              </h3>

              {canDownload && downloadUrl ? (
                <a
                  href={downloadUrl}
                  download
                  className="fade-up mt-4 flex items-center gap-3 rounded-lg border border-[#23232b] bg-[#16161c] p-3 transition hover:border-indigo-500/50"
                >
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-[#0c0c10] text-indigo-400">
                    <DownloadIcon />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">walkthrough.webm</p>
                    <p className="text-xs text-zinc-500">
                      {resolution.label} · Tap to download
                    </p>
                  </div>
                </a>
              ) : status === "error" ? (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300">
                  {error}
                </div>
              ) : (
                <p className="mt-4 text-sm text-zinc-600">
                  Your finished recordings will appear here.
                </p>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
