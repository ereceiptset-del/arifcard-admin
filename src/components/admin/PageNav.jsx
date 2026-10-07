import { Pagination } from "@addiscard/ui";

/**
 * "Showing 21–40 of 57" with Previous / Next, for a list paged on the
 * server or in memory (both give the same `pagination` shape). Hidden
 * when everything fits on one page.
 */
export function PageNav({ pagination, onPage, loading = false }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, pageSize, total } = pagination;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="px-4 pb-4 sm:px-6">
      <Pagination
        hasPrevious={pagination.hasPrevious}
        hasNext={pagination.hasNext}
        onPrevious={() => onPage(page - 1)}
        onNext={() => onPage(page + 1)}
        loading={loading}
        rangeLabel={`Showing ${from}–${to} of ${total}`}
      />
    </div>
  );
}
