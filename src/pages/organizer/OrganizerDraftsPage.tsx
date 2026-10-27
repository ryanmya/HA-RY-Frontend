import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEventDraftsStore } from "@/stores/event-drafts";
import { useEventEditorStore } from "@/stores/event-editor";
import { XIcon } from "lucide-react";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function OrganizerDraftsPage() {
  const drafts = useEventDraftsStore((s) => s.drafts);
  const removeDraft = useEventDraftsStore((s) => s.removeDraft);
  const openEditor = useEventEditorStore((s) => s.openEditor);

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Draf Acara</h1>

      {drafts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Belum ada draf. Draf tersimpan saat Anda menekan "Simpan draf".
          <Button onClick={() => openEditor()}>Buat Acara</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {drafts.map((draft) => (
            <Card
              key={draft.id}
              role="button"
              tabIndex={0}
              onClick={() => openEditor(draft)}
              onKeyDown={(e) => e.key === "Enter" && openEditor(draft)}
              className="relative cursor-pointer transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <CardTitle className="pr-8">{draft.event.name || "Tanpa judul"}</CardTitle>
                <CardDescription>
                  {[draft.event.category, draft.event.location].filter(Boolean).join(" · ") || "Belum ada detail"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                <span>{draft.event.startDate ? formatDate(draft.event.startDate) : "Tanggal belum diatur"}</span>
                <span>
                  {draft.event.isFree ? "Gratis" : `${draft.event.ticketTypes.length} jenis tiket`}
                </span>
                <span className="text-xs">Diubah {formatDate(draft.updatedAt)}</span>
              </CardContent>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Hapus draf"
                className="absolute top-3 right-3"
                onClick={(e) => {
                  e.stopPropagation();
                  removeDraft(draft.id);
                }}
              >
                <XIcon />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
