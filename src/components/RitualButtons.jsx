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

  // 🔵 Reset cooldown daily jika address berubah
  useEffect(() => {
    if (address) autoReset(address);
  }, [address]);

  if (!isConnected || !address) return null;

  async function sendRitual(type, msg) {
    if (isCooldown(type, address)) {
      alert(`You already did ${type} today.`);
      return;
    }

    try {
      let gasLimit;

      // 🔵 Try estimate gas
      try {
        const estimateTx = await writeContractAsync({
          address: CONTRACT,
          abi: ABI,
          functionName: "performRitual",
          args: [msg],
          value: BigInt(fee.toString()),
          account: address,
          gas: undefined,
        });

        gasLimit = estimateTx;
      } catch (_) {
        // 🔥 Fallback (wallet yang tidak support gas estimation)
        gasLimit = BigInt(250000);
      }

      // 🔵 Actual transaction
      const txHash = await writeContractAsync({
        address: CONTRACT,
        abi: ABI,
        functionName: "performRitual",
        args: [msg],
        value: BigInt(fee.toString()),
        gas: gasLimit,
      });

      // Save cooldown
      mark(type, address);

      // Set type for countdown component
      setLastType(type);

    } catch (err) {
      console.error(err);
      alert("Transaction failed / rejected.");
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

      {/* FEE */}
      <div style={{ opacity: 0.7, marginBottom: 6 }}>
        Fee: {fee ? ethers.formatEther(fee) : "..."} ETH
      </div>

      {/* COOLDOWN TIMER */}
      <div style={{ marginTop: 10, textAlign: "center" }}>
        <CooldownTimer type={lastType} address={address} />
      </div>

    </div>
  );
}
