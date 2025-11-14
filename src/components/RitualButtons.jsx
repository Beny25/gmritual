import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useConfig
} from "wagmi";
import { simulateContract } from "wagmi/actions";
import { CONTRACT, ABI } from "../logic/contract";
import { ethers } from "ethers";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";

export default function RitualButtons() {
  const { address, isConnected } = useAccount();
  const wagmiConfig = useConfig();
  const { writeContractAsync } = useWriteContract();
  const [lastType, setLastType] = useState(null);

  // READ FEE WITH WATCH
  const { data: fee, refetch: refetchFee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
    watch: true, // auto refresh
  });

  // AUTO RESET + LOAD FEE AFTER CONNECT
  useEffect(() => {
    if (address) {
      autoReset(address);
      setTimeout(() => refetchFee(), 200); // refresh fee after connect
    }
  }, [address]);

  if (!isConnected || !address) return null;

  async function sendRitual(type, message) {
    if (!fee || Number(fee) === 0) {
      alert("Contract fee not loaded yet. Please wait 1–2 seconds.");
      return;
    }

    if (isCooldown(type, address)) {
      alert(`You already did ${type} today.`);
      return;
    }

    try {
      let request;

      // Try simulateContract first
      try {
        const sim = await simulateContract(wagmiConfig, {
          address: CONTRACT,
          abi: ABI,
          functionName: "performRitual",
          args: [message],
          value: fee,
          account: address,
        });

        request = sim.request;
      } catch (simErr) {
        console.warn("Simulation failed, fallback gas used.", simErr);

        request = {
          address: CONTRACT,
          abi: ABI,
          functionName: "performRitual",
          args: [message],
          value: fee,
          gas: BigInt(250000),
          account: address,
        };
      }

      // Send TX
      const tx = await writeContractAsync(request);

      // Only cooldown after real success
      mark(type, address);
      setLastType(type);

    } catch (err) {
      console.error("TX ERROR:", err);
      alert("Transaction rejected or failed.");
    }
  }

  return (
    <div className="ritual-wrapper" style={{ marginTop: 10 }}>
      
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

      <div style={{ opacity: 0.7, marginBottom: 4 }}>
        Fee: {fee ? ethers.formatEther(fee) : "..."} ETH
      </div>

      <div style={{ marginTop: 10, textAlign: "center" }}>
        <CooldownTimer type={lastType} address={address} />
      </div>
    </div>
  );
}
