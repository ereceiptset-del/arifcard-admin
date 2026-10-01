import { useId } from "react";

/**
 * Small SVG charts, no library. Each chart draws its data and also renders
 * it as a visually hidden table, so the numbers are available to screen
 * readers and nothing is conveyed by shape alone.
 *
 * data: [{ label, value }] — values come from the backend as-is.
 */
export function BarChart({ data, title, valueFormat = (value) => String(value), height = 160, className = "" }) {
  const max = Math.max(1, ...data.map((point) => point.value || 0));
  const gap = 4;
  const barWidth = data.length ? 100 / data.length : 100;
  const titleId = useId();

  return (
    <figure className={`min-w-0 ${className}`} aria-labelledby={titleId}>
      <figcaption id={titleId} className="text-small font-medium text-ink">
        {title}
      </figcaption>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden className="mt-3 block w-full" style={{ height }}>
        <line x1="0" x2="100" y1={height - 0.5} y2={height - 0.5} className="stroke-line" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {data.map((point, index) => {
          const h = ((point.value || 0) / max) * (height - 8);
          return (
            <rect
              key={point.label}
              x={index * barWidth + gap / 10}
              y={height - h}
              width={Math.max(0.5, barWidth - gap / 5)}
              height={h}
              rx="0.6"
              className="fill-accent"
            />
          );
        })}
      </svg>
      <AxisLabels data={data} />
      <DataTable data={data} title={title} valueFormat={valueFormat} />
    </figure>
  );
}

export function LineChart({ data, title, valueFormat = (value) => String(value), height = 160, className = "" }) {
  const max = Math.max(1, ...data.map((point) => point.value || 0));
  const titleId = useId();
  const step = data.length > 1 ? 100 / (data.length - 1) : 100;
  const points = data.map((point, index) => `${(index * step).toFixed(2)},${(height - ((point.value || 0) / max) * (height - 8)).toFixed(2)}`);

  return (
    <figure className={`min-w-0 ${className}`} aria-labelledby={titleId}>
      <figcaption id={titleId} className="text-small font-medium text-ink">
        {title}
      </figcaption>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden className="mt-3 block w-full" style={{ height }}>
        <line x1="0" x2="100" y1={height - 0.5} y2={height - 0.5} className="stroke-line" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {points.length > 1 && (
          <polyline points={points.join(" ")} fill="none" className="stroke-accent" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        )}
      </svg>
      <AxisLabels data={data} />
      <DataTable data={data} title={title} valueFormat={valueFormat} />
    </figure>
  );
}

function AxisLabels({ data }) {
  if (!data.length) return null;
  return (
    <div aria-hidden className="mt-1.5 flex justify-between text-caption text-ink-muted">
      <span>{data[0].label}</span>
      {data.length > 1 && <span>{data[data.length - 1].label}</span>}
    </div>
  );
}

function DataTable({ data, title, valueFormat }) {
  return (
    <table className="sr-only">
      <caption>{title}</caption>
      <tbody>
        {data.map((point) => (
          <tr key={point.label}>
            <th scope="row">{point.label}</th>
            <td>{valueFormat(point.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
