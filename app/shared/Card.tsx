import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export default function Card({
  children,
  title,
  icon,
  action,
  className = "",
}: CardProps) {
  return (
    <section
      className={`rounded-xl border border-[#26262e] bg-[#101015] p-5 ${className}`}
    >
      {(title || action) && (
        <div className={`mb-4 flex items-center ${action ? "justify-between" : ""}`}>
          {title && (
            <div className="flex items-center gap-2.5">
              {icon && <span className="text-indigo-400">{icon}</span>}
              <h2 className="font-semibold text-white">{title}</h2>
            </div>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
