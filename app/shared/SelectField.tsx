import { ChevronDownIcon } from "@/utils/svgs";

type SelectOption = {
  label: string;
  value: string | number;
};

type SelectFieldProps = {
  label: string;
  value: string | number;
  options: SelectOption[];
  disabled?: boolean;
  onChange: (value: number) => void;
};

export default function SelectField({
  label,
  value,
  options,
  disabled,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="flex items-center gap-3 rounded-md bg-black/40 px-3 py-1.5 text-xs backdrop-blur">
      <span className="font-semibold text-zinc-300">{label}</span>
      <div className="relative flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="resolution-select cursor-pointer bg-transparent pr-4 font-semibold text-indigo-400 outline-none disabled:cursor-not-allowed"
        >
          {options.map((option) => (
            <option
              key={option.label}
              value={option.value}
              className="bg-[#16161c] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-0 text-indigo-400" />
      </div>
    </label>
  );
}
