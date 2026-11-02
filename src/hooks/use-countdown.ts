import { useCallback, useEffect, useState } from "react";

/** Counts down whole seconds from `seconds` to 0. `restart()` begins again. Based on wall-clock time, so background tabs stay accurate. */
export function useCountdown(seconds: number) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endsAt]);

  const restart = useCallback(() => setEndsAt(Date.now() + seconds * 1000), [seconds]);

  return { remaining, restart };
}
