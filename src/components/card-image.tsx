import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { Icon } from "@iconify/react";
import type React from "react";

type TypeCardImage = {
  tags?: React.ReactNode;
  imageUrl?: string;
  topLeft?: React.ReactNode;
  title: string;
  startDate: string;
  endDate: string;
  place: string;
  price: number;
  discountedPrice?: number;
  seats?: number;
} & React.ComponentProps<typeof Card>;

export default function CardImage({
  tags,
  imageUrl = "/images/events/event1.png",
  topLeft,
  title,
  startDate,
  endDate,
  place,
  price,
  discountedPrice,
  seats,
  className,
  onClick,
  ...rest
}: TypeCardImage) {
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
      <div className="absolute top-1 left-1 translate-1 z-40 text-destructive">
        {topLeft}
        {/* <Badge variant={"destructive"}>VOUCHER 25%</Badge> */}
      </div>
      <CardHeader>
        <CardContent className="flex gap-4 px-0! mb-2">
          {tags}
          {/* <Badge variant={"muted"}>Music</Badge>
          <Badge variant={"success"} className="text-success">
            4.7
            <Icon icon={"boxicons:star-filled"} />
          </Badge> */}
        </CardContent>
        <CardTitle className="type-card-title">{title}</CardTitle>
        <CardDescription className="flex items-center">
          <span>
            {startDate} {endDate != undefined && "-"} {endDate}
          </span>
          <Icon icon="mdi:dot" />
          <span> {place} </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <span>
          <span
            className={cn(
              "text-xl",
              "text-black",
              "font-extrabold",
              discountedPrice != undefined &&
                "line-through text-sm text-muted-foreground",
            )}
          >
            {formatCurrency(price, "IDR")}
          </span>
          {discountedPrice != undefined && (
            <span className="ml-2 text-xl text-destructive font-extrabold">
              {formatCurrency(discountedPrice, "IDR")}
            </span>
          )}
        </span>
        {seats != undefined ? (
          <span>{seats} kursi tersedia</span>
        ) : (
          <span>Registrasi Dibuka</span>
        )}
      </CardContent>
    </Card>
  );
}
