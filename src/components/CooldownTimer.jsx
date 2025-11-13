import { useEffect, useState } from "react";
import { getCountdown } from "../logic/ritual";

export default function CooldownTimer() {
  const [time, setTime] = useState(getCountdown());

  useEffect(() => {
    const i = setInterval(() => {
      setTime(getCountdown());
    }, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ marginTop: 10, opacity: 0.85, fontSize: 14 }}>
      Next ritual in {time.h}h {time.m}m {time.s}s
    </div>
  );
}
