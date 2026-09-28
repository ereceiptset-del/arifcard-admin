import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldCheck, RefreshCw, X } from "lucide-react";
import { Panel, Button, Badge, Skeleton, ErrorState, useToast } from "@addiscard/ui";
import {
  cardIssuerService,
  ApiError,
  ISSUER_KYC_ORIGINS,
  ISSUER_ONBOARDING_LABEL,
  ISSUER_ONBOARDING_TONE,
} from "@addiscard/services";
import { useAsync } from "../../hooks/useAsync.js";

/**
 * Verification with the card issuer, shown on the Cards page.
 *
 * The issuer's hosted page is embedded in an iframe. Two rules:
 *
 * - **The URL is one-time and lives in memory only.** It carries a token;
 *   it is never put in storage, the address bar or a log.
 * - **The page's message is progress, not a decision.** A `kyc:done`
 *   message is accepted only from the issuer's origin AND from this
 *   iframe's own window, and all it does is close the frame and ask the
 *   backend to check. Whether the customer is verified comes from the
 *   backend, which hears it from the issuer — never from this browser.
 */
export default function IssuerOnboardingPanel() {
  const toast = useToast();
  const load = useCallback(() => cardIssuerService.onboarding(), []);
  const { data, error, loading, reload, setData } = useAsync(load, []);
  const [session, setSession] = useState(null); // { iframeUrl, kycOrigin } — memory only
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const frameRef = useRef(null);

  const onboarding = data?.onboarding;

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const result = await cardIssuerService.refresh();
      setData({ onboarding: result.onboarding });
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not check your verification.");
    } finally {
      setChecking(false);
    }
  }, [setData, toast]);

  useEffect(() => {
    if (!session) return undefined;
    const onMessage = (event) => {
      if (event.origin !== session.kycOrigin) return;
      if (!frameRef.current || event.source !== frameRef.current.contentWindow) return;
      if (event.data?.type !== "kyc:done") return;
      setSession(null);
      toast.success("Submitted. The card issuer will confirm your verification.");
      // Give the issuer a moment, then ask the backend what it knows.
      setTimeout(() => refresh(), 4000);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [session, refresh, toast]);

  const open = async () => {
    setBusy(true);
    try {
      const result = await cardIssuerService.startSession();
      if (result.onboarding) setData({ onboarding: result.onboarding });
      if (!result.iframeUrl) {
        toast.info("We are preparing your verification. Try again in a moment.");
        return;
      }
      // Second lock: only the issuer's known origins are ever embedded.
      const origin = new URL(result.iframeUrl).origin;
      if (origin !== result.kycOrigin || !ISSUER_KYC_ORIGINS.includes(origin)) {
        toast.error("The verification page could not be opened safely.");
        return;
      }
      setSession({ iframeUrl: result.iframeUrl, kycOrigin: origin });
    } catch (problem) {
      toast.error(problem instanceof ApiError ? problem.message : "Could not open your verification.");
      reload();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Skeleton className="h-[120px] w-full" />;
  if (error) return <ErrorState title="Could not load your card issuer verification" message={error.message} onRetry={reload} />;
  if (!onboarding) return null;

  const action = onboarding.action;
  return (
    <Panel
      title="Card issuer verification"
      description="Our card issuer verifies you separately before issuing a card. It takes a few minutes."
      action={<Badge tone={ISSUER_ONBOARDING_TONE[onboarding.state]}>{ISSUER_ONBOARDING_LABEL[onboarding.state] || onboarding.state}</Badge>}
    >
      <p className="text-[13.5px] text-ink dark:text-ink-dark">{onboarding.blocked?.message || onboarding.message}</p>

      {onboarding.state === "ACTION_REQUIRED" && onboarding.providerMessage && (
        <p className="mt-2 text-[12.5px] text-ink-muted dark:text-ink-muted-dark">{onboarding.providerMessage}</p>
      )}

      {session ? (
        <div className="mt-4">
          <iframe
            ref={frameRef}
            src={session.iframeUrl}
            title="Card issuer identity verification"
            allow="camera"
            referrerPolicy="no-referrer"
            className="h-[780px] w-full rounded-panel border border-line dark:border-line-dark bg-white"
          />
          <div className="mt-3 flex justify-end">
            <Button variant="secondary" size="sm" icon={X} onClick={() => setSession(null)}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {action && (
            <Button icon={ShieldCheck} loading={busy} onClick={open}>
              {action === "resume" ? "Continue verification" : "Start verification"}
            </Button>
          )}
          {!["NOT_STARTED", "APPROVED"].includes(onboarding.state) && !onboarding.blocked && (
            <Button variant="secondary" icon={RefreshCw} loading={checking} onClick={refresh}>
              Check status
            </Button>
          )}
        </div>
      )}
    </Panel>
  );
}
