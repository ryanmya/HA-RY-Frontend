import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Height 32, padding 8/13, radius 999, label 12.5/600
const chipBase =
  "inline-flex h-8 items-center gap-1 rounded-full border px-[13px] py-2 text-[12.5px] font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50";
const chipOff = "border-border bg-white text-foreground hover:bg-muted-subtle";
const chipOn = "border-primary bg-primary-subtle text-primary";

const chipVariants = cva(chipBase, {
  variants: {
    selected: { true: chipOn, false: chipOff },
  },
  defaultVariants: { selected: false },
});

/* 1. Removable filter chip */
type ChipProps = {
  selected?: boolean;
  onRemove?: () => void;
} & React.ComponentProps<"span">;

function Chip({ selected = true, onRemove, className, children, ...rest }: ChipProps) {
  return (
    <span className={cn(chipVariants({ selected }), className)} {...rest}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Hapus filter"
          className="-mr-1 grid place-items-center rounded-full hover:opacity-70"
        >
          <Icon icon="mdi:close" className="size-3.5" />
        </button>
      )}
    </span>
  );
}

/* 2. Toggle chip (on/off) */
function ChipToggle({ className, ...props }: React.ComponentProps<typeof Toggle>) {
  return (
    <Toggle
      className={cn(
        chipBase,
        chipOff,
        "data-pressed:border-primary data-pressed:bg-primary-subtle data-pressed:text-primary",
        className,
      )}
      {...props}
    />
  );
}

/* 3. Segmented chips: borderless chips in a track, active one white with shadow */
type ChipSegmentedProps = {
  options: { value: string; label: React.ReactNode }[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

function ChipSegmented({ options, value, onValueChange, className }: ChipSegmentedProps) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  // measure the active item so the white pill can slide to it
  useLayoutEffect(() => {
    const el = itemRefs.current[value];
    if (!el) return;
    const measure = () => setPill({ left: el.offsetLeft, width: el.offsetWidth });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, options]);

  return (
    <ToggleGroup
      spacing={0}
      value={[value]}
      // ignore deselect so one option always stays active
      onValueChange={(v) => v[0] && onValueChange(v[0])}
      className={cn("relative gap-0 rounded-full bg-muted-subtle p-1", className)}
    >
      {pill && (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          ref={(el) => {
            itemRefs.current[o.value] = el;
          }}
          className={cn(
            chipBase,
            "relative z-10 rounded-full! border-transparent bg-transparent! text-foreground transition-colors duration-300 hover:bg-transparent",
            "data-pressed:text-primary",
          )}
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export { Chip, ChipToggle, ChipSegmented, chipVariants };
