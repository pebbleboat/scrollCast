import SelectField from "../shared/SelectField";
import { RESOLUTIONS } from "../types";
import { LockIcon, MonitorIcon } from "@/utils/svgs";
import type { ReactNode } from "react";

type PreviewWindowProps = {
  previewUrl: string;
  children: ReactNode;
  resolutionIndex: number;
  onResolutionChange: (index: number) => void;
  disabled?: boolean;
};

export default function PreviewWindow({
  previewUrl,
  children,
  resolutionIndex,
  onResolutionChange,
  disabled,
}: PreviewWindowProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#26262e] bg-[#101015]">
      <div className="flex items-center gap-3 border-b border-[#1e1e25] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-2 flex flex-1 items-center gap-2 rounded-md bg-[#1a1a21] px-3 py-1.5 text-xs text-zinc-500">
          <LockIcon />
          <span className="truncate">{previewUrl}</span>
        </div>
      </div>

      <div className="preview-bg relative flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
        {children}

        <div className="absolute bottom-5 left-5 flex flex-col gap-1.5 text-left">
          <SelectField
            label="Resolution"
            value={resolutionIndex}
            options={RESOLUTIONS.map((r, i) => ({ label: r.label, value: i }))}
            onChange={onResolutionChange}
            disabled={disabled}
          />
          <div className="flex items-center gap-3 rounded-md bg-black/40 px-3 py-1.5 text-xs backdrop-blur">
            <span className="font-semibold text-zinc-300">FPS</span>
            <span className="font-semibold text-indigo-400">60</span>
          </div>
        </div>

        <div className="absolute bottom-5 right-5 hidden h-20 w-28 items-center justify-center rounded-lg border border-[#2a2a33] bg-[#0c0c10] sm:flex">
          <MonitorIcon />
        </div>
      </div>
    </section>
  );
}
