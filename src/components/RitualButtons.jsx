import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import CooldownTimer from "./CooldownTimer";
import { CONTRACT, ABI } from "../logic/contract";
import { ethers } from "ethers";

const TYPES = [
  { key: "GM", label: "GM Ritual 🌞", msg: "GM ⚡" },
  { key: "GN", label: "GN Ritual 🌙", msg: "GN 🌙" },
  { key: "SLEEP", label: "GoSleep 😴", msg: "GoSleep 😴" },
];

export default function RitualButtons() {
  const { address, isConnected } = useAccount();
  const [isSending, setIsSending] = useState(false);
  const [fee, setFee] = useState(null);

  // FETCH FEE ON LOAD
  useEffect(() => {
    async function load() {
      try {
        if (!window.ethereum || !isConnected) return;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const c = new ethers.Contract(CONTRACT, ABI, provider);

        const f = await c.fee();
        setFee(ethers.formatEther(f));
      } catch (e) {
        console.warn("Cannot load fee:", e);
      }
    }
    load();
  }, [isConnected]);

  // CHECK IF TODAY DONE
  function doneToday(type) {
    if (!address) return false;
    const key = `cool_${type}_${address}`;
    return localStorage.getItem(key) === new Date().toISOString().slice(0, 10);
  }

  function markToday(type) {
    if (!address) return;
    const key = `cool_${type}_${address}`;
    localStorage.setItem(key, new Date().toISOString().slice(0, 10));
  }

  // ===== SEND TX =====
  async function doRitual(type, msg) {
    try {
      if (!isConnected) {
        alert("Please connect wallet first.");
        return;
      }

      if (!window.ethereum) {
        alert("No wallet found.");
        return;
      }

      if (doneToday(type)) {
        alert(`You already did ${type} today.`);
        return;
      }

      setIsSending(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT, ABI, signer);

      // GET FEE
      const ritualFee = await c.fee();

      // GAS ESTIMATE (even if eth = 0)
      try {
        await c.performRitual.estimateGas(msg, { value: ritualFee });
      } catch (err) {
        console.warn("Gas estimation failed:", err);
        alert("Cannot estimate gas. Make sure you have Base network selected.");
        setIsSending(false);
        return;
      }

      // SEND TX
      const tx = await c.performRitual(msg, { value: ritualFee });
      alert("Transaction sent. Waiting...");

      await tx.wait();
      alert(`${type} ritual completed!`);

      markToday(type);
    } catch (err) {
      console.error(err);
      alert("TX failed!");
    }

    setIsSending(false);
  }

  if (!isConnected)
    return (
      <p style={{ textAlign: "center", opacity: 0.7 }}>
        Connect your wallet to begin the rituals.
      </p>
    );

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <p style={{ opacity: 0.7 }}>
        Ritual fee: {fee ? `${fee} ETH` : "..."}
      </p>

      {TYPES.map((r) => (
        <div key={r.key} style={{ marginBottom: 12 }}>
          <button
            onClick={() => doRitual(r.key, r.msg)}
            disabled={isSending || doneToday(r.key)}
            style={{
              minWidth: 240,
              padding: "14px 18px",
              borderRadius: 12,
              fontWeight: 600,
              background: doneToday(r.key)
                ? "#94a3b8"
                : "#2563eb",
              color: "white",
              opacity: isSending ? 0.6 : 1,
            }}
          >
            {r.label}
          </button>

          {/* COOLDOWN TIMER */}
          <CooldownTimer type={r.key} address={address} />
        </div>
      ))}
    </div>
  );
}
