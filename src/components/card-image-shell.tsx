import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type React from "react";

type TypeCardImageShell = {
  imageUrl?: string;
  topLeft?: React.ReactNode;
  /** Free content below the image. */
  children?: React.ReactNode;
  /** Classes for the content area, e.g. "flex flex-col gap-4". */
  contentClassName?: string;
} & React.ComponentProps<typeof Card>;

// CardImage's look (dimmed cover, top-left slot, hover when clickable) with an open content area.
export default function CardImageShell({
  imageUrl = "/images/events/event1.png",
  topLeft,
  children,
  contentClassName,
  className,
  onClick,
  ...rest
}: TypeCardImageShell) {
  return (
    <Card
      className={cn(
        "relative w-full pt-0 ring-0",
        // Only clickable cards get the hover lift and press feedback.
        onClick &&
          "cursor-pointer transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && e.currentTarget.click() : undefined}
      {...rest}
    >
      {imageUrl ? (
        <>
          <div className="absolute inset-0 z-20 aspect-video bg-black/35"></div>
          <img
            src={imageUrl}
            alt="Event Cover"
            className="relative z-10 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
          />
        </>
      ) : (
        <div className="aspect-video w-full bg-muted-subtle" aria-hidden="true" />
      )}
      {topLeft && <div className="absolute top-1 left-1 translate-1 z-40 text-destructive">{topLeft}</div>}
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
