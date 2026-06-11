import { STATUS_LABELS, type SessionStatus } from "../types";

type StatusChipProps = {
  status: SessionStatus;
};

const styles: Record<SessionStatus, string> = {
  idle: "border-indigo-500/40 text-indigo-300",
  recording: "border-red-500/40 text-red-300",
  done: "border-emerald-500/40 text-emerald-300",
  stopped: "border-amber-500/40 text-amber-300",
  error: "border-red-500/40 text-red-300",
};

export default function StatusChip({ status }: StatusChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "recording" ? "recording-dot bg-red-400" : "bg-current"
        }`}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
