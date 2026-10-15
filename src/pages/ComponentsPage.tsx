import { Button } from "@/components/ui/button";
import StepBreadcrumb from "@/components/step-bread-crumbs";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { useState } from "react";
import DataTable, { type Column } from "@/components/data-table";
import CardImage from "@/components/card-image";
import QuantityStepper from "@/components/quantity-stepper";
import { TextAreaField, TextField } from "@/components/text-field";
import { Chip, ChipSegmented, ChipToggle } from "@/components/chip";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Ticket = {
  id: string;
  name: string;
  access: string;
  seats: number;
  price: number;
};

const tickets: Ticket[] = [
  {
    id: "reg",
    name: "Regular",
    access: "2 hari, main hall",
    seats: 184,
    price: 1200000,
  },
  {
    id: "ws",
    name: "Workshop",
    access: "2 hari + 3 lab",
    seats: 40,
    price: 1850000,
  },
  {
    id: "stu",
    name: "Student",
    access: "Hari 1, wajib KTM",
    seats: 12,
    price: 450000,
  },
  {
    id: "exe",
    name: "Executive",
    access: "2 hari + gala dinner",
    seats: 0,
    price: 4200000,
  },
];

const idr = (n: number) => "IDR " + n.toLocaleString("id-ID");

export default function ComponentsPage() {
  const [qty, setQty] = useState<Record<string, number>>({ reg: 1 });
  const [chipSegmented, setChipSegmented] = useState<string>("opt1");
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const setTicketQty = (id: string, value: number) =>
    setQty((q) => ({ ...q, [id]: value }));

  const columns: Column<Ticket>[] = [
    {
      key: "name",
      header: "Jenis",
      cell: (t) => <span className="font-semibold">{t.name}</span>,
    },
    { key: "access", header: "Akses" },
    { key: "seats", header: "Kursi", align: "right" },
    {
      key: "price",
      header: "Harga",
      align: "right",
      cell: (t) => <span className="text-lg font-bold">{idr(t.price)}</span>,
    },
    {
      key: "qty",
      header: "Jumlah",
      align: "right",
      cell: (t) =>
        t.seats === 0 ? (
          <Badge variant="secondary">Habis</Badge>
        ) : (
          <QuantityStepper
            value={qty[t.id] ?? 0}
            onChange={(v) => setTicketQty(t.id, v)}
            max={t.seats}
          />
        ),
    },
  ];

  const venues = [
    "venue A",
    "venue B",
    "venue C",
    "venue D",
    "venue E",
    "venue F",
    "venue G",
  ];
  const [venue, setVenue] = useState<string[]>([]);

  const setToggleVenues = (value: string, on: boolean): void => {
    setVenue((v) => (on ? [...v, value] : v.filter((e) => e !== value)));
  };

  return (
    <div className="w-full flex flex-col p-6 bg-background gap-4">
      <div>Components</div>
      <div className="flex gap-2">
        <Button>Default</Button>
        <Button variant={"outline"}>Outline</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="destructive_outline">Destructive Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex gap-2 items-center">
        <Chip onRemove={(): void => {}}>Chip</Chip>
        <ChipSegmented
          value={chipSegmented}
          onValueChange={(e) => setChipSegmented(e)}
          options={[
            {
              label: "Opt1",
              value: "opt1",
            },
            {
              label: "Opt2",
              value: "opt2",
            },
          ]}
        ></ChipSegmented>
      </div>
      <div className="flex">
        <Card className="min-w-fit">
          <CardHeader>
            <CardTitle>Chip Toggle</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="flex gap-2">
              {venues.map((v) => (
                <ChipToggle
                  key={v}
                  pressed={venue.includes(v)}
                  onPressedChange={(on) => setToggleVenues(v, on)}
                >
                  {v}
                </ChipToggle>
              ))}
            </span>
          </CardContent>
          <CardFooter>
            <span>
              Listed :{" "}
              {venue.map((e, i) => (i !== venue.length - 1 ? e + ", " : e))}
            </span>
          </CardFooter>
        </Card>
      </div>
      <div className="flex gap-2">
        <Badge variant={"default"}>
          <Icon icon={"mdi:home"} />
          Badge
          <Icon icon={"mdi:cog"} />
        </Badge>
        <Badge>Primary</Badge>
        <Badge variant="muted">muted</Badge>
        <Badge variant="destructive">destructive</Badge>
        <Badge variant="success">success</Badge>
        <Badge variant="warning">warning</Badge>
      </div>
      <div className="flex">
        <CardImage
          imageUrl="/images/events/event1.png"
          topLeft={<Badge variant="destructive">VOUCHER 25%</Badge>}
          title="Event 1"
          tags={
            <>
              <Badge variant="muted">Nature</Badge>
              <Badge variant="success">
                4.7
                <Icon icon="boxicons:star-filled" />
              </Badge>
            </>
          }
          startDate="04"
          endDate="06 Okt"
          place="Nature"
          price={900000}
          discountedPrice={8000000}
          seats={10}
        />
        {/* <CardImage/> */}
      </div>
      <div className="flex max-w-sm flex-col gap-4">
        <TextField label="Nama acara" defaultValue="Ngarupat Jazz Night" />
        <TextField
          label="Cari"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          hint={search && "mencari…"}
        />
        <TextAreaField
          label="Deskripsi"
          defaultValue="Enam penampil di halaman Pasar Santa."
        />
      </div>
      <DataTable
        columns={columns}
        items={tickets}
        getRowKey={(t) => t.id}
        isRowActive={(t) => (qty[t.id] ?? 0) > 0}
        isRowDisabled={(t) => t.seats === 0}
      />
      <div className="flex flex-col gap-2 rounded-lg bg-background p-4">
        <StepBreadcrumb
          steps={[
            { label: "Tiket dipilih", variant: "done" },
            { label: "Diskon & poin", variant: "done" },
            { label: "Bukti pembayaran", variant: "active" },
            { label: "Konfirmasi penyelenggara", variant: "idle" },
          ]}
        />
        <StepBreadcrumb
          steps={[
            { label: "Tiket dipilih", variant: "done" },
            { label: "Diskon & poin", variant: "done" },
            { label: "Bukti pembayaran", variant: "fail" },
            { label: "Konfirmasi penyelenggara" },
          ]}
        />
        <StepBreadcrumb
          layout="bar"
          steps={[
            { label: "Menunggu pembayaran", description: "Selesai 19:21", variant: "done" },
            { label: "Menunggu konfirmasi admin", description: "Batas 3 hari", variant: "active" },
            { label: "Selesai", description: "Tiket terbit" },
          ]}
        />
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger render={<Button>Open Dialog</Button>}></DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <Button
              variant={"destructive"}
              icon
              className="bg-destructive-subtle"
            >
              <Icon icon="mdi:exclamation" className="text-destructive" />
            </Button>
          </DialogHeader>
          <DialogHeader>
            <DialogTitle className="font-extrabold">
              Tolak Pesanan #04188?
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            10 Kursi kembali, voucher dan kupon diaktifkan kembali, dan 12.500
            dikreditkan ulang.
          </DialogDescription>
          <div className="flex gap-[14px]">
            <Button variant="outline" className="flex-1" onClick={() => setOpenDialog(false)}>Batal</Button>
            <Button variant="destructive" className="flex-1">Tolak</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
