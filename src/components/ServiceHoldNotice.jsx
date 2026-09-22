import { PauseCircle } from "lucide-react";
import { Panel, Skeleton } from "@addiscard/ui";
import { featuresService } from "@addiscard/services";
import { useAsync } from "../hooks/useAsync.js";

/**
 * Lists the integrations the server currently reports as paused.
 *
 * Every word shown here comes from `GET /api/features`. Nothing is
 * hardcoded, so this cannot claim a service is available when the backend
 * would refuse it, or keep saying "paused" after it resumes.
 *
 * Renders nothing when everything is available, and nothing when the
 * backend cannot be reached — an unreachable server is a connection
 * problem, not evidence that a feature is on hold.
 */
export function ServiceHoldNotice({ only }) {
  const { data, error, loading } = useAsync(() => featuresService.list(), []);

  if (loading) return <Skeleton className="h-[72px] w-full" />;
  if (error || !data?.features) return null;

  const paused = Object.entries(data.features)
    .filter(([name, feature]) => !feature.available && (!only || only.includes(name)));

  if (paused.length === 0) return null;

  return (
    <Panel>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warn/10 text-warn">
          <PauseCircle size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink dark:text-ink-dark">
            {paused.length === 1 ? "A service is paused" : "Some services are paused"}
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {paused.map(([name, feature]) => (
              <li key={name} className="text-[13px] text-ink-muted dark:text-ink-muted-dark">
                <span className="text-ink dark:text-ink-dark">{feature.message}.</span>{" "}
                {feature.reason}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-ink-faint">
            Nothing already submitted is affected. Your records and uploaded documents are kept.
          </p>
        </div>
      </div>
    </Panel>
  );
}
