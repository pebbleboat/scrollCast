type SliderProps = {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

export default function Slider({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  disabled,
  onChange,
}: SliderProps) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-medium uppercase tracking-wider text-zinc-500">
        <span>{label}</span>
        <span className="font-semibold text-indigo-400">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
}
