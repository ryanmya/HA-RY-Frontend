import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex shrink-0 overflow-hidden border border-transparent transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary-subtle text-primary [a]:hover:bg-primary/20",
        muted: "bg-muted-subtle text-muted [a]:hover:bg-muted/20",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive-subtle text-destructive",
        success: "bg-success-subtle text-success",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        warning: "bg-warning-subtle text-warning"
      },
      size: {
        default:
          "h-5 w-fit items-center justify-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        lg: "w-full items-start gap-3 rounded-lg p-5 text-sm whitespace-normal",
      },
    },
    compoundVariants: [
      { size: "lg", variant: "default", className: "bg-primary-subtle/20" },
      { size: "lg", variant: "muted", className: "bg-muted-subtle/20" },
      { size: "lg", variant: "destructive", className: "bg-destructive-subtle/20" },
      { size: "lg", variant: "success", className: "bg-success-subtle/20" },
      { size: "lg", variant: "warning", className: "bg-warning-subtle/20" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
    },
  });
}

export { Badge, badgeVariants };
