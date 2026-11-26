import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 100;
export const XERO_ROW_HEIGHT = 52;
const WINDOW_THRESHOLD = 400;
const OVERSCAN = 8;

/** One continuous result set: applied query snapshots, serial page loading and stale-response guards. */
export const useContinuousXeroList = ({ fetchPage, resultKey, rowKey, initialQuery, refreshList, onLoaded, onReset, active }) => {
  const [list, setList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingRows, setLoadingRows] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);
  const headerRef = useRef(null);
  const state = useRef({ generation: 0, request: null, nextPage: 0, rows: [], more: true, query: initialQuery });
  const callbacks = useRef({ fetchPage, rowKey, resultKey, onLoaded, onReset });
  callbacks.current = { fetchPage, rowKey, resultKey, onLoaded, onReset };

  const loadMore = useCallback(async () => {
    const current = state.current;
    if (current.request || !current.more) return;
    const request = { generation: current.generation, page: current.nextPage };
    current.request = request;
    setLoadingRows(true);
    setError("");
    try {
      const { data } = await callbacks.current.fetchPage({ ...current.query, page: request.page, pageSize: PAGE_SIZE });
      if (request.generation !== state.current.generation) return;
      if (!data?.success) throw new Error("List request failed");
      const batch = data.data?.[callbacks.current.resultKey] || [];
      // A row may appear again while server-side records change. Keep identities unique.
      const seen = new Set(current.rows.map(callbacks.current.rowKey));
      const appended = batch.filter((row) => {
        const key = callbacks.current.rowKey(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      current.rows = [...current.rows, ...appended];
      current.nextPage = request.page + 1;
      const metadata = data.metadata?.page;
      current.more =
        batch.length > 0 && (metadata?.totalPages != null ? current.nextPage < metadata.totalPages : batch.length === PAGE_SIZE);
      setList(current.rows);
      setTotalRecords(metadata?.totalRecords ?? current.rows.length);
      setHasMore(current.more);
      if (request.page === 0) callbacks.current.onLoaded?.();
    } catch (failure) {
      if (request.generation === state.current.generation) {
        setError("Unable to load these records. Please retry.");
      }
    } finally {
      if (state.current.request === request) {
        state.current.request = null;
        setLoadingRows(false);
      }
    }
  }, []);

  const reload = useCallback(
    (query) => {
      const current = state.current;
      current.generation += 1;
      current.query = query;
      current.request = null;
      current.nextPage = 0;
      current.rows = [];
      current.more = true;
      setList([]);
      setTotalRecords(0);
      setHasMore(true);
      setError("");
      callbacks.current.onReset?.();
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      loadMore();
    },
    [loadMore],
  );

  const started = useRef(false);
  useEffect(() => {
    if (!started.current || refreshList) {
      started.current = true;
      reload(state.current.query);
    }
  }, [refreshList, reload]);
  useEffect(
    () => () => {
      started.current = false;
      state.current.generation += 1;
      state.current.request = null;
    },
    [],
  );

  useEffect(() => {
    const root = scrollRef.current,
      sentinel = sentinelRef.current;
    if (!active || !root || !sentinel || !hasMore || loadingRows || error) return;
    if (typeof IntersectionObserver === "undefined") return; // The Load more button remains available.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { root, rootMargin: "200px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [active, hasMore, loadingRows, error, loadMore, list.length]);

  const [viewport, setViewport] = useState({ top: 0, height: 500, header: 0 });
  useEffect(() => {
    const root = scrollRef.current;
    if (!active || !root) return;
    let frame;
    const measure = () =>
      setViewport({ top: root.scrollTop, height: root.clientHeight, header: headerRef.current?.getBoundingClientRect().height || 0 });
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(root);
    if (headerRef.current) observer?.observe(headerRef.current);
    measure();
    return () => {
      root.removeEventListener("scroll", onScroll);
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [active]);
  const windowed = list.length > WINDOW_THRESHOLD;
  const start = windowed
    ? Math.max(0, Math.min(list.length - 1, Math.floor(Math.max(0, viewport.top - viewport.header) / XERO_ROW_HEIGHT) - OVERSCAN))
    : 0;
  const end = windowed ? Math.min(list.length, start + Math.ceil(viewport.height / XERO_ROW_HEIGHT) + OVERSCAN * 2) : list.length;

  return {
    list,
    totalRecords,
    loadingRows,
    hasMore,
    error,
    loadMore,
    reload,
    scrollRef,
    sentinelRef,
    headerRef, rowOffset: start,
    visibleRows: list.slice(start, end),
    topSpace: start * XERO_ROW_HEIGHT,
    bottomSpace: (list.length - end) * XERO_ROW_HEIGHT,
  };
};
