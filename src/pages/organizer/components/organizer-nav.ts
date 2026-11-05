// Sidebar entries for the organizer area. Paths are relative to /organizer.
export type OrganizerNavItem = {
  label: string;
  to: string;
  count?: number;
  countTone?: "muted" | "destructive";
};

export const organizerNav: OrganizerNavItem[] = [
  { label: "Ringkasan", to: "/organizer" },
  { label: "Acara", to: "/organizer/events" },
  { label: "Draf Acara", to: "/organizer/drafts" },
  { label: "Transaksi", to: "/organizer/transactions", countTone: "destructive" },
  { label: "Peserta", to: "/organizer/attendees" },
  { label: "Ulasan", to: "/organizer/reviews" },
  { label: "Profil", to: "/organizer/profile" },
];
