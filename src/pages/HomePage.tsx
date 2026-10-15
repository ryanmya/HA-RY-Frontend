import { TextField } from "@/components/text-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <div className="">
      <div className="h-fit relative isolate overflow-hidden pt-[38px] flex flex-col px-7 gap-7">
        <div className="absolute inset-0 -z-10 bg-primary h-1/2"></div>
        <div className="flex flex-col gap-2">
          <div className="text-[44px] font-bold text-white">
            Cari acara, amankan kursinya.
          </div>
          <div className="text-white/70">
            4200 acara aktif di 61 kota - konser, konferensi, lari, workshop.
          </div>
        </div>
        <Card>
          <CardContent className="grid grid-cols-[4fr_4fr_4fr_1fr] items-end gap-1">
            <TextField label="Cari" />
            <TextField label="Kota" />
            <TextField label="Tanggal" />
            <Button>Cari Acara</Button>
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
    </div>
  );
}
