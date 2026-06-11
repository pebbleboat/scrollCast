export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e25] bg-[#0c0c10]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">ScrollCast</p>
          <p className="text-xs text-zinc-600">
            © 2026 ScrollCast. Professional Recording Suite.
          </p>
        </div>
        <div className="flex gap-6 text-xs text-zinc-500">
          <a className="transition hover:text-zinc-300" href="#">
            Privacy Policy
          </a>
          <a className="transition hover:text-zinc-300" href="#">
            Terms of Service
          </a>
          <a className="transition hover:text-zinc-300" href="#">
            Help Center
          </a>
        </div>
      </div>
    </footer>
  );
}
