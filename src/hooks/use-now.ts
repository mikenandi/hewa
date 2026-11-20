import { useEffect, useState } from "react";

// Re-renders every minute so clocks on screen stay current.
export const useNow = (): Date => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};
