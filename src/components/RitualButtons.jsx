import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CONTRACT, ABI } from "../logic/contract";
import { ethers } from "ethers";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";

export default function RitualButtons() {
  const { address, isConnected } = useAccount();
  const [lastType, setLastType] = useState(null);

  const { data: fee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
  });

  const { writeContractAsync } = useWriteContract();

  // 🔥 Auto reset setiap change wallet
  useEffect(() => {
    if (address) autoReset(address);
  }, [address]);

  if (!isConnected || !address) return null;

  async function sendRitual(type, msg) {
    //Cooldown Check
    if (isCooldown(type, address)) {
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

      // 🔥 Save cooldown only after TX
      mark(type, address);

      // 🔥 Set jenis ritual untuk countdown
      setLastType(type);

    } catch (err) {
      console.error(err);
      alert("Transaction rejected or failed.");
    }
  }

  return (
    <div className="ritual-wrapper" style={{ marginTop: 10 }}>

      {/* BUTTONS */}
      <div className="row" style={{ marginBottom: 12 }}>

        <button
          className={`btn gm ${isCooldown("GM", address) ? "disabled" : ""}`}
          onClick={() => sendRitual("GM", "GM ⚡")}
        >
          GM Ritual 🌞
        </button>

        <button
          className={`btn gn ${isCooldown("GN", address) ? "disabled" : ""}`}
          onClick={() => sendRitual("GN", "GN 🌙")}
        >
          GN Ritual 🌙
        </button>

        <button
          className={`btn sleep ${isCooldown("SLEEP", address) ? "disabled" : ""}`}
          onClick={() => sendRitual("SLEEP", "GoSleep 😴")}
        >
          GoSleep 😴
        </button>
      </div>

      {/* FEE */}
      <div style={{ opacity: 0.7, marginBottom: 4 }}>
        Fee: {fee ? ethers.formatEther(fee) : "..."} ETH
      </div>

      {/* 🔥 Countdown ALWAYS below buttons */}
      <div style={{ marginTop: 8, textAlign: "center" }}>
        <CooldownTimer type={lastType} address={address} />
      </div>

    </div>
  );
}
