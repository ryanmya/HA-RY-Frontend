import type React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const fieldLabel =
  "text-xs font-semibold tracking-wider text-muted-foreground uppercase";
const fieldBox =
  "rounded-xl border-border bg-white px-4 text-[15px] md:text-[15px] text-foreground focus-visible:border-primary focus-visible:ring-primary/20";

type FieldWrapperProps = {
  id: string;
  label?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

function FieldWrapper({ id, label, className, children }: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label htmlFor={id} className={fieldLabel}>
          {label}
        </Label>
      )}
      {children}
    </div>
  );
}

type TextFieldProps = {
  label?: React.ReactNode;
  hint?: React.ReactNode; // shown inside the input on the right, e.g. "mencari…"
  wrapperClassName?: string;
} & React.ComponentProps<typeof Input>;

function TextField({ label, hint, wrapperClassName, className, id, ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <FieldWrapper id={inputId} label={label} className={wrapperClassName}>
      <div className="relative">
        <Input id={inputId} className={cn(fieldBox, "h-12", hint && "pr-24", className)} {...props} />
        {hint && (
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
    </FieldWrapper>
  );
}

type TextAreaFieldProps = {
  label?: React.ReactNode;
  wrapperClassName?: string;
} & React.ComponentProps<typeof Textarea>;

function TextAreaField({ label, wrapperClassName, className, id, ...props }: TextAreaFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <FieldWrapper id={inputId} label={label} className={wrapperClassName}>
      <Textarea id={inputId} className={cn(fieldBox, "min-h-20 py-3", className)} {...props} />
    </FieldWrapper>
  );
}

export { TextField, TextAreaField };
