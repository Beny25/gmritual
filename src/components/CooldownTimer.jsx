import { useState, useEffect } from "react";
import { isCooldown } from "../logic/ritual";

export default function CooldownTimer({ type, address }) {
  const [remaining, setRemaining] = useState(null);

  function getNextUTCReset() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    // Reset target = 00:00 UTC
    return new Date(Date.UTC(year, month, day + 1, 0, 0, 0));
  }

  useEffect(() => {
    if (!address) return;

    // Kalau tidak cooldown, tidak tampilkan timer
    if (!isCooldown(type, address)) {
      setRemaining(null);
      return;
    }

    const target = getNextUTCReset();

    const interval = setInterval(() => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setRemaining(null);
        clearInterval(interval);
        return;
      }

      const h = Math.floor(diff / 1000 / 60 / 60);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setRemaining(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [type, address]);

  if (!remaining) return null;

  return (
    <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
      Next ritual in {remaining}
    </div>
  );
}
