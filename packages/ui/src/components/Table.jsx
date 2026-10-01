import { ChevronRight } from "lucide-react";
import { Skeleton } from "./Skeleton.jsx";

/**
 * Data table. Columns: `{ key, header, render?, align?, className?, hideBelow? }`.
 *
 * - From `sm` up it is a table: 52px rows, first column is the row's
 *   identity (ink, medium), numerals right-aligned (`align: "right"`).
 * - Below `sm` every row becomes a stacked card (label/value pairs), so
 *   the page never scrolls sideways.
 * - `hideBelow: "lg"` drops a secondary column on narrower desktops.
 * - With `onRowClick` a row is a button: Enter/Space open it.
 */
export function Table({ columns, rows, keyField = "id", loading = false, skeletonRows = 4, empty, onRowClick, caption }) {
  if (loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-2 p-4 sm:p-6">
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!rows?.length) return empty || null;

  const interactive = Boolean(onRowClick);
  const activate = (row) => (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  };
  const [first, ...rest] = columns;
  const cell = (column, row) => (column.render ? column.render(row) : row[column.key]);
  const hide = (column) => (column.hideBelow === "lg" ? "hidden lg:table-cell" : column.hideBelow === "md" ? "hidden md:table-cell" : "");

  return (
    <>
      <div className="hidden w-full sm:block">
        <table className="w-full border-collapse text-left">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-caption font-medium text-ink-muted first:pl-6 last:pr-6 ${
                    column.align === "right" ? "text-right" : ""
                  } ${hide(column)} ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
              {interactive && <th aria-hidden className="w-10 pr-4" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[keyField]}
                onClick={interactive ? () => onRowClick(row) : undefined}
                onKeyDown={interactive ? activate(row) : undefined}
                tabIndex={interactive ? 0 : undefined}
                className={`border-b border-line last:border-0 ${interactive ? "cursor-pointer hover:bg-surface-2 focus-visible:bg-surface-2" : ""}`}
              >
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={`h-[52px] px-4 py-2 text-small first:pl-6 last:pr-6 ${
                      index === 0 ? "font-medium text-ink" : "text-ink-soft"
                    } ${column.align === "right" ? "text-right tabular-nums" : ""} ${hide(column)} ${column.className || ""}`}
                  >
                    {cell(column, row)}
                  </td>
                ))}
                {interactive && (
                  <td aria-hidden className="pr-4 text-ink-muted">
                    <ChevronRight size={16} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line sm:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={row[keyField]}>
            <div
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={interactive ? () => onRowClick(row) : undefined}
              onKeyDown={interactive ? activate(row) : undefined}
              className={`flex items-start gap-3 px-4 py-4 ${interactive ? "cursor-pointer active:bg-surface-2" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-small font-medium text-ink">{cell(first, row)}</div>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                  {rest.map((column) => (
                    <div key={column.key} className="min-w-0">
                      <dt className="text-caption text-ink-muted">{column.header}</dt>
                      <dd className={`text-small text-ink-soft ${column.align === "right" ? "tabular-nums" : ""}`}>{cell(column, row)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {interactive && <ChevronRight size={16} aria-hidden className="mt-0.5 shrink-0 text-ink-muted" />}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
