import type { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement>;

export default function InputField({ className = "", ...props }: InputFieldProps) {
  return (
    <input
      className={`flex-1 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600 disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
