/** Loading placeholder. Decorative, so hidden from assistive tech. */
export function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-line dark:bg-line-dark ${className}`}
    />
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={`h-3 ${index === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}
