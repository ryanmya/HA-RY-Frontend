import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, ReactNode } from "react";

type RadioCardProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "title"> & {
    title: ReactNode;
    description?: ReactNode;
};

export default function RadioCard({ title, description, className, ...props }: RadioCardProps) {
    return <label className={cn(
        "group relative flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors",
        "hover:bg-accent/40 has-checked:border-primary has-checked:bg-primary/5",
        "has-focus-visible:ring-2 has-focus-visible:ring-ring/50 has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className
    )}>
        <div className="flex-1">
            <div className="font-bold">{title}</div>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <input type="radio" className="peer sr-only" {...props} />
        <span className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/40 transition-colors",
            "peer-checked:border-primary",
            "after:size-2.5 after:rounded-full after:bg-primary after:scale-0 after:transition-transform peer-checked:after:scale-100"
        )} />
    </label>
}
