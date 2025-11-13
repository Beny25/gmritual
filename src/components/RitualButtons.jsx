// src/components/RitualButtons.jsx
import { useAccount } from "wagmi";
import { useState } from "react";
import { CONTRACT, ABI } from "../logic/contract";
import { ethers } from "ethers";
import CooldownTimer from "./CooldownTimer";

export default function RitualButtons() {
  const { address, isConnected } = useAccount();
  const [fee, setFee] = useState(null);

  async function perform(type, msg) {
    try {
      const eth = window.ethereum;
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT, ABI, signer);

      const ritualFee = await c.fee();
      setFee(ritualFee.toString());

      const tx = await c.performRitual(msg, { value: ritualFee });
      alert("TX sent — waiting...");
      await tx.wait();

      localStorage.setItem(`cool_${type}_${address}`, new Date().toISOString().slice(0, 10));
      alert(`${type} ritual done`);

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("TX failed");
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      {!isConnected && <p>Connect wallet first</p>}

      {isConnected && (
        <>
          <div style={{ marginBottom: 20 }}>
            <button className="btn gm" onClick={() => perform("GM", "GM ⚡")}>
              GM Ritual 🌞
            </button>

            <button className="btn gn" onClick={() => perform("GN", "GN 🌙")}>
              GN Ritual 🌙
            </button>

            <button className="btn sleep" onClick={() => perform("SLEEP", "GoSleep 😴")}>
              GoSleep 😴
            </button>
          </div>

          {/* Cooldowns */}
          <CooldownTimer type="GM" address={address} />
          <CooldownTimer type="GN" address={address} />
          <CooldownTimer type="SLEEP" address={address} />

          <p style={{ marginTop: 20 }}>
            Ritual fee: {fee ? ethers.formatEther(fee) : "..."} ETH
          </p>
        </>
      )}
    </div>
  );
 }
