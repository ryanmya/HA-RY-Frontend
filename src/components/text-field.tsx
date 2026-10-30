import type React from "react";
import { useId, useState } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const fieldLabel =
  "text-xs font-semibold tracking-wider text-muted-foreground uppercase";
const fieldBox =
  "rounded-xl border-border bg-field px-4 text-[15px] md:text-[15px] text-foreground focus-visible:border-primary focus-visible:ring-primary/20";

type FieldWrapperProps = {
  id: string;
  label?: React.ReactNode;
  topRight?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

function FieldWrapper({ id, label, topRight, className, children }: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {(label || topRight) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <Label htmlFor={id} className={fieldLabel}>
              {label}
            </Label>
          )}
          {topRight && <div className="ml-auto text-sm">{topRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

type TextFieldProps = {
  label?: React.ReactNode;
  hint?: React.ReactNode; // shown inside the input on the right, e.g. "mencari…"
  topRight?: React.ReactNode; // shown above the input on the right, e.g. a "Lupa kata sandi?" link
  wrapperClassName?: string;
} & React.ComponentProps<typeof Input>;

function TextField({ label, hint, topRight, wrapperClassName, className, id, type, ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FieldWrapper id={inputId} label={label} topRight={topRight} className={wrapperClassName}>
      <div className="relative">
        <Input
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          className={cn(fieldBox, "h-12", hint && "pr-24", isPassword && "pr-12", className)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} className="size-5" />
          </button>
        )}
        {hint && !isPassword && (
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
  topRight?: React.ReactNode;
  wrapperClassName?: string;
} & React.ComponentProps<typeof Textarea>;

function TextAreaField({ label, topRight, wrapperClassName, className, id, ...props }: TextAreaFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <FieldWrapper id={inputId} label={label} topRight={topRight} className={wrapperClassName}>
      <Textarea id={inputId} className={cn(fieldBox, "min-h-20 py-3", className)} {...props} />
    </FieldWrapper>
  );
}

export { TextField, TextAreaField };
