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
  imageUrl: string;
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
  imageUrl = "https://avatar.vercel.sh/shadcn1",
  topLeft,
  title,
  startDate,
  endDate,
  place,
  price,
  discountedPrice,
  seats,
  ...rest
}: TypeCardImage) {
  return (
    <Card className="relative mx-auto w-full max-w-sm pt-0 ring-0" {...rest}>
      <div className="absolute inset-0 z-20 aspect-video bg-black/35"></div>
      <img
        src={imageUrl}
        alt="Event Cover"
        className="relative z-10 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
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
        <CardTitle className="font-bold">{title}</CardTitle>
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
