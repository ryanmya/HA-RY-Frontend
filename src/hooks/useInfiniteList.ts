import type { Paginated } from "@/types/pagination";
import { useCallback, useEffect, useRef, useState } from "react";

type FetchPage<T> = (cursor: string | null) => Promise<Paginated<T>>;

// Loads a cursor-paginated list page by page. Attach `sentinelRef` to an element after the list;
// the next page loads when it scrolls into view. Changing `deps` resets the list and starts over.
export function useInfiniteList<T>(fetchPage: FetchPage<T>, deps: unknown[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A ref so the observer never starts a second request while one is running.
  const loadingRef = useRef(false);
  // Bumped on reset, so a response from before the reset is ignored.
  const generation = useRef(0);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    const gen = generation.current;
    try {
      const page = await fetchRef.current(cursor);
      if (gen !== generation.current) return;
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.nextCursor !== null);
    } catch {
      if (gen === generation.current) setError("Gagal memuat data.");
    } finally {
      if (gen === generation.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [cursor, hasMore]);

  // Reset when the inputs change (e.g. a filter, or a newly published event).
  useEffect(() => {
    generation.current++;
    loadingRef.current = false;
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setLoading(false);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Load the next page whenever the sentinel is near the viewport.
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (el: HTMLElement | null) => {
      observer.current?.disconnect();
      if (!el || !hasMore || error) return;
      observer.current = new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore(), {
        rootMargin: "400px",
      });
      observer.current.observe(el);
    },
    [loadMore, hasMore, error],
  );

  return { items, loading, error, hasMore, loadMore, sentinelRef };
}
