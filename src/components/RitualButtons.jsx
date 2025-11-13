import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useEffect } from "react";
import { CONTRACT, ABI } from "../logic/contract";
import { mark, isCooldown, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";
import { ethers } from "ethers";

export default function RitualButtons() {
  const { address, isConnected } = useAccount();

  const { data: fee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
  });

  const { writeContractAsync } = useWriteContract();

  // 🔥 FIX: Auto reset ONLY after address loaded
  useEffect(() => {
    if (address) autoReset(address);
  }, [address]);

  if (!isConnected || !address) return null;

  async function sendRitual(type, msg) {
    // 🔥 FIX: cooldown only if address available
    if (address && isCooldown(type, address)) {
      alert(`You already did ${type} today.`);
      return;
    }

    try {
      const txHash = await writeContractAsync({
        address: CONTRACT,
        abi: ABI,
        functionName: "performRitual",
        args: [msg],
        value: BigInt(fee.toString()),
        gas: BigInt(250000),
      });

      // cooldown AFTER tx sent
      mark(type, address);

    } catch (err) {
      console.error(err);
      alert("Transaction failed / rejected.");
    }
  }

  return (
    <div className="ritual-wrapper" style={{ marginTop: 12 }}>

      {/* BUTTON AREA */}
      <div className="row ritual-buttons" style={{ marginBottom: 10 }}>
        <button
          className={`btn gm ${address && isCooldown("GM", address) ? "disabled" : ""}`}
          onClick={() => sendRitual("GM", "GM ⚡")}
        >
          GM Ritual 🌞
        </button>

        <button
          className={`btn gn ${address && isCooldown("GN", address) ? "disabled" : ""}`}
          onClick={() => sendRitual("GN", "GN 🌙")}
        >
          GN Ritual 🌙
        </button>

        <button
          className={`btn sleep ${address && isCooldown("SLEEP", address) ? "disabled" : ""}`}
          onClick={() => sendRitual("SLEEP", "GoSleep 😴")}
        >
          GoSleep 😴
        </button>
      </div>

      {/* Fee */}
      <div style={{ opacity: 0.7, marginBottom: 6 }}>
        Fee: {fee ? ethers.formatEther(fee) : "..."} ETH
      </div>

      {/* 🔥 COOLDOWN ALWAYS BELOW BUTTONS */}
      <div className="cooldown" style={{ marginTop: 10, textAlign: "center" }}>
        <CooldownTimer />
      </div>

    </div>
  );
}
