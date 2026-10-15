import { Fragment } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

const stepVariants = cva(
  "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        idle: "bg-muted-subtle text-muted-foreground",
        active: "bg-primary-subtle text-primary",
        done: "bg-success-subtle text-success",
        fail: "bg-destructive-subtle text-destructive",
      },
    },
    defaultVariants: { variant: "idle" },
  },
);

// "bar" layout: progress bar on top, label + description below
const barVariants = cva("h-1 rounded-full", {
  variants: {
    variant: {
      idle: "bg-muted-subtle",
      active: "bg-primary",
      done: "bg-success",
      fail: "bg-destructive",
    },
  },
  defaultVariants: { variant: "idle" },
});

const barLabelVariants = cva("text-sm font-semibold", {
  variants: {
    variant: {
      idle: "text-muted-foreground font-normal",
      active: "text-primary",
      done: "text-foreground",
      fail: "text-destructive",
    },
  },
  defaultVariants: { variant: "idle" },
});

export type Step = {
  label: string;
  description?: string;
} & VariantProps<typeof stepVariants>;

type StepBreadcrumbProps = {
  steps: Step[];
  layout?: "chip" | "bar";
  className?: string;
};

export default function StepBreadcrumb({ steps, layout = "chip", className }: StepBreadcrumbProps) {
  if (layout === "bar") {
    return (
      <nav aria-label="Progress" className={cn("flex w-full gap-3", className)}>
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex flex-1 flex-col gap-1.5"
            aria-current={step.variant === "active" ? "step" : undefined}
          >
            <div className={barVariants({ variant: step.variant })} />
            <span className={barLabelVariants({ variant: step.variant })}>{step.label}</span>
            {step.description && (
              <span className="text-xs text-muted-foreground">{step.description}</span>
            )}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Progress" className={cn("flex flex-wrap items-center gap-2", className)}>
      {steps.map((step, i) => (
        <Fragment key={i}>
          {i > 0 && <Icon icon="lucide:chevron-right" className="size-4 text-muted-foreground" aria-hidden />}
          <span
            className={stepVariants({ variant: step.variant })}
            aria-current={step.variant === "active" ? "step" : undefined}
          >
            {i + 1} · {step.label}
          </span>
        </Fragment>
      ))}
    </nav>
  );
}
