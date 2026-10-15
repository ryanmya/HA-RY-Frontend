import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export default function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  className,
}: QuantityStepperProps) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  return (
    <div
      className={cn(
        "inline-flex items-center gap-4 rounded-full border px-3 py-1",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Kurangi"
        onClick={() => set(value - 1)}
        disabled={value <= min}
        className="text-primary disabled:text-muted-foreground"
      >
        −
      </button>
      <span className="w-4 text-center" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Tambah"
        onClick={() => set(value + 1)}
        disabled={value >= max}
        className="text-primary disabled:text-muted-foreground"
      >
        +
      </button>
    </div>
  );
}
