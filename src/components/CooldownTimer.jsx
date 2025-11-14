import { useEffect, useState } from "react";
import { isCooldown, nextResetUTC } from "../logic/ritual";

export default function CooldownTimer({ type, address }) {
  const [timeLeft, setTimeLeft] = useState(null);

  // Belum ada ritual → timer tidak tampil
  if (!type || !address) return null;

  // Jika belum cooldown → timer tidak tampil
  if (!isCooldown(type, address)) return null;

  function calculate() {
    const next = nextResetUTC();
    const now = new Date();

    const diff = next - now;

    if (diff <= 0) {
      setTimeLeft("0h 0m 0s");
      return;
    }

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    setTimeLeft(`${h}h ${m}m ${s}s`);
  }

  useEffect(() => {
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [type, address]);

  if (!timeLeft) return null;

  return (
    <div style={{ fontSize: 14, opacity: 0.8 }}>
      Next ritual in {timeLeft}
    </div>
  );
}
