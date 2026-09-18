import { useEffect, useRef, useState } from "react";

/**
 * useCountdown
 *
 * Ticks a countdown down from `seconds` to 0, once per second.
 * Used by the verification screen to show "Code expires in 4:58" without
 * any resend affordance — the timer is purely informational.
 */
export function useCountdown(seconds, { onExpire } = {}) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setSecondsLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpireRef.current?.();
      return undefined;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${minutes}:${String(secs).padStart(2, "0")}`;

  return { secondsLeft, formatted, expired: secondsLeft <= 0 };
}
