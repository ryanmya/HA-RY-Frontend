import { Popover } from "@base-ui/react/popover";
import { Icon } from "@iconify/react";
import { useId } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { id as idLocale } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type { DateRange };

const fmt = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

// "5 Okt 2026 – 12 Okt 2026", or just the start while the end isn't picked yet.
function formatRange(range?: DateRange) {
  if (!range?.from) return "";
  if (!range.to || range.to.getTime() === range.from.getTime()) return fmt(range.from);
  return `${fmt(range.from)} – ${fmt(range.to)}`;
}

type DateRangeFieldProps = {
  label?: React.ReactNode;
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
};

// One field that opens a two-month calendar; click a start day, then an end day.
export function DateRangeField({ label, value, onChange, placeholder = "Pilih tanggal", className }: DateRangeFieldProps) {
  const id = useId();
  const text = formatRange(value);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </Label>
      )}
      <Popover.Root>
        <Popover.Trigger
          id={id}
          className="flex h-12 w-full items-center gap-2 rounded-xl border border-border bg-field px-4 text-left text-[15px] outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
        >
          <Icon icon="lucide:calendar" className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn("flex-1 truncate", !text && "text-muted-foreground")}>{text || placeholder}</span>
          {text && (
            <span
              role="button"
              aria-label="Hapus tanggal"
              className="text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            >
              <Icon icon="lucide:x" className="size-4" />
            </span>
          )}
        </Popover.Trigger>
        <Popover.Portal>
          {/* Above the navbar (z-50) and the pinned search bar. */}
          <Popover.Positioner sideOffset={8} align="start" className="z-60">
            <Popover.Popup className="rounded-xl bg-card p-3 shadow-lg ring-1 ring-foreground/10 [--rdp-accent-background-color:var(--color-primary-subtle)] [--rdp-accent-color:var(--color-primary)]">
              <DayPicker
                mode="range"
                numberOfMonths={2}
                locale={idLocale}
                selected={value}
                onSelect={onChange}
                defaultMonth={value?.from}
              />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
