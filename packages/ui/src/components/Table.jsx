import { Skeleton } from "./Skeleton.jsx";

/**
 * Data table with built-in loading and empty handling.
 *
 * Columns: { key, header, render?, align?, className? }
 * Below `sm` the table scrolls inside its own container so the page
 * itself never scrolls sideways.
 */
export function Table({
  columns,
  rows,
  keyField = "id",
  loading = false,
  skeletonRows = 4,
  empty,
  onRowClick,
  caption,
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-5">
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (!rows?.length) {
    return empty || null;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-line dark:border-line-dark">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint ${
                  column.align === "right" ? "text-right" : ""
                } ${column.className || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const interactive = Boolean(onRowClick);
            return (
              <tr
                key={row[keyField]}
                onClick={interactive ? () => onRowClick(row) : undefined}
                onKeyDown={
                  interactive
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={interactive ? 0 : undefined}
                role={interactive ? "button" : undefined}
                className={`border-b border-line dark:border-line-dark last:border-0 ${
                  interactive
                    ? "cursor-pointer hover:bg-panel-muted dark:hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40"
                    : ""
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-5 py-3.5 text-[13.5px] text-ink dark:text-ink-dark ${
                      column.align === "right" ? "text-right" : ""
                    } ${column.className || ""}`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
