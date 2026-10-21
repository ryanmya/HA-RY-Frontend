import CardImage from "@/components/card-image";
import { TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TypeEvent } from "@/types";
import { Icon } from "@iconify/react";

type TypeEventGroup = {
  title: string;
  count: number;
  icon: string;
};

export default function HomePage() {
  const eventGroup: TypeEventGroup[] = [
    { title: "Musik", count: 1204, icon: "lucide:music" },
    { title: "Konferensi", count: 610, icon: "lucide:presentation" },
    { title: "Seni", count: 388, icon: "lucide:palette" },
    { title: "Olahraga", count: 271, icon: "lucide:trophy" },
    { title: "Workshop", count: 194, icon: "lucide:wrench" },
    { title: "Gratis", count: 412, icon: "lucide:ticket" },
  ];

  const tickets: TypeEvent[] = [
    {
      id: "evt-001",
      title: "Bromo Sunrise Trek",
      imageUrl: "/images/events/event1.png",
      category: "Nature",
      rating: 4.7,
      startDate: "2026-10-04",
      endDate: "2026-10-06",
      place: "Mount Bromo, East Java",
      price: 1200000,
      discountedPrice: 900000,
      seats: 10,
      voucherPercent: 25,
    },
    {
      id: "evt-002",
      title: "Jakarta Jazz Night",
      imageUrl: "/images/events/event1.png",
      category: "Music",
      rating: 4.9,
      startDate: "2026-11-14",
      endDate: "2026-11-14",
      place: "JIExpo Kemayoran, Jakarta",
      price: 850000,
      seats: 120,
    },
    {
      id: "evt-003",
      title: "Bali Food Festival",
      imageUrl: "/images/events/event1.png",
      category: "Culinary",
      rating: 4.5,
      startDate: "2026-12-05",
      endDate: "2026-12-07",
      place: "Renon Square, Denpasar",
      price: 150000,
      discountedPrice: 120000,
      seats: 300,
      voucherPercent: 20,
    },
    {
      id: "evt-004",
      title: "UI/UX Design Workshop",
      imageUrl: "/images/events/event1.png",
      category: "Education",
      startDate: "2026-11-22",
      // endDate: "2026-11-22",
      place: "Purwadhika BSD, Tangerang",
      price: 350000,
      seats: 25,
    },
  ];

  return (
    <div className="flex border-none p-0 flex-col gap-8">
      <div className="h-fit relative isolate overflow-hidden pt-[38px] flex flex-col px-20 gap-7">
        <div className="absolute inset-0 -z-10 bg-primary h-7/8"></div>
        <div className="flex flex-col gap-2">
          <div className="text-[44px] font-bold text-white">
            Cari acara, amankan kursinya.
          </div>
          <div className="text-white/70">
            4200 acara aktif di 61 kota - konser, konferensi, lari, workshop.
          </div>
        </div>
        <Card className="p-3">
          <CardContent className="p-0">
            <form className="grid grid-cols-[4fr_4fr_4fr_1fr] items-end gap-1">
              <TextField label="Cari"/>
              <TextField label="Kota"/>
              <TextField label="Tanggal"/>
              <Button>Cari Acara</Button>
            </form>
          </CardContent>
        </Card>
        <div className="grid grid-cols-6 gap-3">
          {eventGroup.map((group) => (
            <Card key={group.title}>
              <CardContent className="flex flex-col items-center gap-1">
                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon icon={group.icon} className="size-4" />
                </div>
                <div className="font-semibold">{group.title}</div>
                <div className="text-sm text-muted-foreground">
                  {group.count.toLocaleString("id-ID")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="px-20 flex justify-between">
        <div className="flex flex-col gap-4">
          <div className="type-section">Acara Terdekat</div>
          <div className="flex items-center">
            Oktober 2026 <Icon icon={"mdi:dot"} /> Jakarta dan sekitarnya
          </div>
        </div>

        <Button variant={"link"} appendIcon={<Icon icon="mdi:arrow-right" />}>
          Lihat semua 4.200
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2 px-20">
        {tickets.map((e, i) => (
          <CardImage
            {...e}
            key={i}
            tags={
              <>
                <Badge variant={"default"}>{e.category}</Badge>
                {e.rating && (
                  <Badge variant={"success"}>
                    {e.rating}
                    <Icon icon={"boxicons:star-filled"} />
                  </Badge>
                )}
              </>
            }
            topLeft={
              e.voucherPercent && (
                <Badge variant={"destructive"}>
                  Discount {e.voucherPercent}%
                </Badge>
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
