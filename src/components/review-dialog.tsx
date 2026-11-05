import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { createReview } from "@/lib/reviews";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useState } from "react";

const MAX_COMMENT = 500;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventName: string;
  /** Called after a successful submit, or on 409 (already reviewed). */
  onReviewed: () => void;
};

export default function ReviewDialog({ open, onOpenChange, eventId, eventName, onReviewed }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = comment.trim();
  const valid = rating >= 1 && trimmed.length > 0 && trimmed.length <= MAX_COMMENT;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await createReview(eventId, { rating, comment: trimmed });
      onReviewed();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        onReviewed();
        onOpenChange(false);
        return;
      }
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const shown = hover || rating;

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tulis ulasan</DialogTitle>
          <DialogDescription>{eventName}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} bintang`}
                className={cn("text-3xl", n <= shown ? "text-yellow-500" : "text-muted-foreground/40")}
                onMouseEnter={() => setHover(n)}
                onClick={() => setRating(n)}
              >
                <Icon icon="mdi:star" />
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <Textarea
              value={comment}
              maxLength={MAX_COMMENT}
              placeholder="Ceritakan pengalaman Anda di acara ini"
              onChange={(e) => setComment(e.target.value)}
            />
            <span className="self-end text-xs text-muted-foreground">
              {comment.length}/{MAX_COMMENT}
            </span>
          </div>

          {error && (
            <Badge variant="destructive" size="lg">
              <span>{error}</span>
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">Ulasan tidak bisa diubah setelah dikirim.</span>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button disabled={!valid || submitting} onClick={handleSubmit}>
            {submitting ? "Mengirim…" : "Kirim ulasan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
