import { useState, useEffect } from "react";
import { writeContract, readContract } from "@wagmi/core";
import CooldownTimer from "./CooldownTimer";
import { CONTRACT, ABI } from "../logic/constants";
import { config } from "../wagmi";

export default function RitualButtons({ address, isConnected }) {
  const [cooldowns, setCooldowns] = useState({
    GM: null,
    GN: null,
    SLEEP: null,
  });

  // Load cooldown from localStorage
  useEffect(() => {
    if (!address) return;
    const keys = ["GM", "GN", "SLEEP"];
    const cd = {};
    keys.forEach(k => {
      const saved = localStorage.getItem("cool_" + k + "_" + address);
      cd[k] = saved ? new Date(saved) : null;
    });
    setCooldowns(cd);
  }, [address]);


  async function run(type, message) {
    if (!isConnected) return alert("Connect wallet first");

    const todayUTC = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem("cool_" + type + "_" + address);
    if (saved === todayUTC)
      return alert("You already did " + type + " today");

    try {
      const fee = await readContract({
        address: CONTRACT,
        abi: ABI,
        functionName: "fee",
        config,
      });

      const tx = await writeContract({
        address: CONTRACT,
        abi: ABI,
        functionName: "performRitual",
        args: [message],
        value: fee,
        config,
      });

      alert("TX sent, wait...");

      // save cooldown
      localStorage.setItem("cool_" + type + "_" + address, todayUTC);
      setCooldowns(prev => ({
        ...prev,
        [type]: new Date(),
      }));

      alert(type + " ritual complete!");
    } catch (err) {
      console.error(err);
      alert("Ritual failed");
    }
  }

  return (
    <div className="row">
      <button
        className="btn gm"
        disabled={!isConnected || cooldowns.GM}
        onClick={() => run("GM", "GM ⚡")}
      >
        GM Ritual 🌞
      </button>

      <button
        className="btn gn"
        disabled={!isConnected || cooldowns.GN}
        onClick={() => run("GN", "GN 🌙")}
      >
        GN Ritual 🌙
      </button>

      <button
        className="btn sleep"
        disabled={!isConnected || cooldowns.SLEEP}
        onClick={() => run("SLEEP", "GoSleep 😴")}
      >
        GoSleep 😴
      </button>

      {/* Show cooldown timer */}
      {isConnected && (
        <CooldownTimer cooldowns={cooldowns} />
      )}
    </div>
  );
}
