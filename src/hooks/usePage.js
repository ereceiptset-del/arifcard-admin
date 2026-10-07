import { useCallback, useState } from "react";

/**
 * The current page of a list, back at 1 whenever `resetKey` (the list's
 * filters) changes — derived during render, so a filter change never
 * fetches the old page first.
 */
export function usePage(resetKey = "") {
  const [state, setState] = useState({ key: resetKey, page: 1 });
  const page = state.key === resetKey ? state.page : 1;
  const setPage = useCallback((next) => setState({ key: resetKey, page: Math.max(1, next) }), [resetKey]);
  return [page, setPage];
}

/** One page of a list already in memory, in the same shape the backend returns. */
export function pageRows(rows = [], page = 1, pageSize = 20) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    pagination: { page: current, pageSize, total, totalPages, hasPrevious: current > 1, hasNext: current < totalPages },
  };
}
