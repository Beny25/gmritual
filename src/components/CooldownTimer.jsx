import { useEffect, useState } from "react";

export default function CooldownTimer() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();

      // Reset ke 00:00 UTC besok
      const reset = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0, 0, 0
        )
      );

      const diff = (reset - now) / 1000;
      if (diff <= 0) {
        setTimeLeft("Ready!");
        return;
      }

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = Math.floor(diff % 60);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ opacity: 0.8, marginTop: 10 }}>
      Next ritual in {timeLeft}
    </div>
  );
}
