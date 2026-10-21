import { useEffect } from "react";
import { useAtom } from "jotai";
import { todayAtom } from "./KlartAtoms";
import { toLocalDate } from "./LocalDate";

const CHECK_INTERVAL_MS = 30_000;

/** Keeps {@link todayAtom} in step with the clock, so My Day rolls over at midnight. Mount once. */
export function useTodayTicker(): void {
  const [today, setToday] = useAtom(todayAtom);

  useEffect(() => {
    function check(): void {
      const current = toLocalDate(new Date());
      if (current !== today) {
        setToday(current);
      }
    }

    check();
    const timer = window.setInterval(check, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [today, setToday]);
}
