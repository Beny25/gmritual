import { useEffect, useState } from "react";

export default function CooldownTimer({ type, address }) {
  const todayUTC = new Date().toISOString().slice(0, 10);
  const key = `cool_${type}_${address}`;
  const doneToday = localStorage.getItem(key) === todayUTC;

  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!doneToday) return;

    function update() {
      const now = new Date();
      const reset = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0
      ));

      const diff = reset - now;

      if (diff <= 0) {
        setRemaining("");
        return;
      }

      const h = Math.floor(diff / 1000 / 3600);
      const m = Math.floor((diff / 1000 % 3600) / 60);
      const s = Math.floor(diff / 1000 % 60);

      setRemaining(`${h}h ${m}m ${s}s`);
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [doneToday]);

  if (!doneToday) return null;

  return (
    <div style={{ textAlign: "center", marginTop: "6px" }}>
      <p className="cd1">Next {type} in <strong>{remaining}</strong></p>
      <p className="cd2">Reset at 00:00 UTC</p>
    </div>
  );
}
