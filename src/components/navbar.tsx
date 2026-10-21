import type { ReactNode } from "react";

export type NavSlots = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
};

export default function Navbar({ left, center, right }: NavSlots) {
  return (
    <nav className="flex h-16 bg-white border-black items-center justify-between px-6 gap-4 z-100 sticky top-0">
      <span className="text-primary font-bold">{left}</span>
      <div className="flex-1 flex justify-start">{center}</div>
      <div className="flex justify-end">{right}</div>
    </nav>
  );
}
