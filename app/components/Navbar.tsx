import StatusChip from "../shared/StatusChip";
import type { SessionStatus } from "../types";
import { BellIcon, SettingsIcon } from "@/utils/svgs";

type NavbarProps = {
  status: SessionStatus;
};

export default function Navbar({ status }: NavbarProps) {
  return (
    <header className="border-b border-[#1e1e25]">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold tracking-tight text-white">
            ScrollCast
          </span>
          <StatusChip status={status} />
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <button className="transition hover:text-white" aria-label="Notifications">
            <BellIcon />
          </button>
          <button className="transition hover:text-white" aria-label="Settings">
            <SettingsIcon />
          </button>
          <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-400 to-indigo-700 ring-1 ring-white/10" />
        </div>
      </div>
    </header>
  );
}
