import { useEffect, useState } from "react";
import { getCooldownRemaining } from "../logic/ritual";

export default function CooldownTimer({ type, address }) {
  const [remain, setRemain] = useState(0);

  useEffect(() => {
    if (!address || !type) return;

    function tick() {
      setRemain(getCooldownRemaining(type, address));
    }

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [type, address]);

  if (remain <= 0) return null;

  const hours = Math.floor(remain / 3600000);
  const mins = Math.floor((remain % 3600000) / 60000);
  const secs = Math.floor((remain % 60000) / 1000);

  return (
    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
      Next ritual in {hours}h {mins}m {secs}s
    </div>
  );
}
