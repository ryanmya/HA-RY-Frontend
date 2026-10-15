import type { NavSlots } from "@/components/navbar";
import { useMatches } from "react-router";

export type RouteHandle = { nav?: NavSlots };

export function useNavSlots(defaults: NavSlots): NavSlots {
  const matches = useMatches();
  const findMatch = [...matches]
    .reverse()
    .find((m) => (m.handle as RouteHandle | undefined)?.nav)?.handle as
    | RouteHandle
    | undefined;

  return { ...defaults, ...findMatch?.nav };
}
