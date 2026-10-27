import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { EventDraft } from "@/types/event"

// The backend has no drafts endpoint, so drafts are kept in this browser's localStorage.
type EventDraftsState = {
  drafts: EventDraft[]
  saveDraft: (draft: EventDraft) => void
  removeDraft: (id: string) => void
}

export const useEventDraftsStore = create<EventDraftsState>()(
  persist(
    (set) => ({
      drafts: [],
      saveDraft: (draft) =>
        set((s) => ({
          drafts: [draft, ...s.drafts.filter((d) => d.id !== draft.id)],
        })),
      removeDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
    }),
    { name: "event-drafts" },
  ),
)
