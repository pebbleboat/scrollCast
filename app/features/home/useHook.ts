"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_RECORDER_CONFIG,
  INITIAL_SESSION,
  RESOLUTIONS,
  type RecorderConfig,
  type SessionState,
} from "../../types";

export function useHook() {
  const [urls, setUrls] = useState(["https://pebbleboat.com/"]);
  const [config, setConfig] = useState<RecorderConfig>(DEFAULT_RECORDER_CONFIG);
  const [session, setSession] = useState<SessionState>(INITIAL_SESSION);

  const { id: sessionId, status, hasVideo, error, isStarting } = session;
  const isRecording = status === "recording";
  const isDisabled = isRecording || isStarting;
  const resolution = RESOLUTIONS[config.resolutionIndex];
  const canDownload = Boolean(sessionId && hasVideo);
  const previewUrl = urls.find((u) => u.trim()) || "https://scrollcast.io/preview";

  useEffect(() => {
    if (!sessionId || (status !== "recording" && (hasVideo || status === "error"))) {
      return;
    }

    const timer = setInterval(async () => {
      const response = await fetch(`/api/record/${sessionId}`);
      const data = await response.json();

      setSession((current) => ({
        ...current,
        status: data.status,
        hasVideo: Boolean(data.hasVideo),
        error: data.error ?? current.error,
      }));
    }, 1500);

    return () => clearInterval(timer);
  }, [sessionId, status, hasVideo]);

  function updateConfig(patch: Partial<RecorderConfig>) {
    setConfig((current) => ({ ...current, ...patch }));
  }

  function updateUrl(index: number, value: string) {
    setUrls((current) => current.map((url, i) => (i === index ? value : url)));
  }

  function addUrl() {
    setUrls((current) => [...current, ""]);
  }

  function removeUrl(index: number) {
    setUrls((current) => current.filter((_, i) => i !== index));
  }

  async function startRecording() {
    setSession({
      id: null,
      status: "recording",
      hasVideo: false,
      error: null,
      isStarting: true,
    });

    try {
      const response = await fetch("/api/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: urls,
          scrollType: config.type,
          pixelsPerStep: config.pixelsPerStep,
          intervalMs: config.intervalMs,
          jumpWaitMs: config.jumpWaitMs,
          width: resolution.width,
          height: resolution.height,
        }),
      });

      let data: {
        sessionId?: string;
        status?: SessionState["status"];
        hasVideo?: boolean;
        error?: string;
      };

      try {
        data = await response.json();
      } catch {
        setSession({
          id: null,
          status: "error",
          hasVideo: false,
          error: "Server returned an invalid response. Please try again.",
          isStarting: false,
        });
        return;
      }

      if (!response.ok) {
        setSession((current) => ({
          ...current,
          status: "error",
          error: data.error ?? "Failed to start recording",
          isStarting: false,
        }));
        return;
      }

      setSession((current) => ({
        ...current,
        id: data.sessionId ?? null,
        status: data.status ?? "recording",
        hasVideo: Boolean(data.hasVideo),
        error: data.error ?? null,
        isStarting: false,
      }));
    } catch {
      setSession({
        id: null,
        status: "error",
        hasVideo: false,
        error: "Could not reach the server. Please try again.",
        isStarting: false,
      });
    }
  }

  async function stopRecording() {
    if (!sessionId) return;
    await fetch(`/api/record/${sessionId}`, { method: "DELETE" });
  }

  return {
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
    previewUrl,
    updateUrl,
    addUrl,
    removeUrl,
    startRecording,
    stopRecording,
  };
}
