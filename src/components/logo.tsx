import { cn } from "@/lib/utils";
import type React from "react";

const colors = {
  primary: "text-primary",
  white: "text-white",
  current: "text-current",
};

const fontSizes = {
  "sm": "text-sm",
  "md": "text-base",
  "lg": "text-lg",
  "xl": "text-xl",
  "2xl": "text-2xl"
}

const LETTERS = "HA&RY".split("");

type LogoProps = React.ComponentProps<"span"> & {
  fontSize?: keyof typeof fontSizes;
  color?: keyof typeof colors;
  /** Letters bounce one after another in a wave, for use as a loading indicator. */
  loading?: boolean;
};

export default function Logo({ fontSize = "2xl", color = "primary", loading = false, className, ...props }: LogoProps) {
  return (
    <span
      className={cn(fontSizes[fontSize], colors[color], className, "inline-flex font-extrabold")}
      role={loading ? "status" : undefined}
      aria-label={loading ? "Memuat" : undefined}
      {...props}
    >
      {LETTERS.map((letter, i) => (
        <span
          key={i}
          aria-hidden={loading || undefined}
          className={cn(loading && "animate-logo-wave motion-reduce:animate-pulse")}
          style={loading ? { animationDelay: `${i * 120}ms` } : undefined}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}
