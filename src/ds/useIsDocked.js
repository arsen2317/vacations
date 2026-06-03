import { useState, useEffect } from "react";

const DOCKED_BREAKPOINT = 1720;

export function useIsDocked() {
  const [isDocked, setIsDocked] = useState(() => window.innerWidth >= DOCKED_BREAKPOINT);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DOCKED_BREAKPOINT}px)`);
    const handler = (e) => setIsDocked(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDocked;
}
