import { create } from "zustand"
import type { EventDraft } from "@/types/event"

// Opens the "Buat Acara" dialog from anywhere: empty for a new event, or prefilled from a draft.
type EventEditorState = {
  open: boolean
  draft: EventDraft | null
  openEditor: (draft?: EventDraft) => void
  closeEditor: () => void
  // Bumped after an event is published; pages that list events refetch when it changes.
  eventsVersion: number
  markEventsChanged: () => void
  transactionsVersion: number
  markTransactionsChanged: () => void
}

export const useEventEditorStore = create<EventEditorState>()((set) => ({
  open: false,
  draft: null,
  openEditor: (draft) => set({ open: true, draft: draft ?? null }),
  closeEditor: () => set({ open: false }),
  eventsVersion: 0,
  markEventsChanged: () => set((s) => ({ eventsVersion: s.eventsVersion + 1 })),
  transactionsVersion: 0,
  markTransactionsChanged: () =>
    set((s) => ({ transactionsVersion: s.transactionsVersion + 1 })),
}))
