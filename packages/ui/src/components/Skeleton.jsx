/**
 * Loading placeholder. Decorative, so hidden from assistive tech — the
 * region that is loading carries `aria-busy` instead. A gentle pulse, no
 * shimmer; reduced motion stops it.
 */
export function Skeleton({ className = "" }) {
  return <div aria-hidden className={`animate-pulse rounded-control bg-surface-2 ${className}`} />;
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
