import { useAccount, useReadContract, useWriteContract } from "wagmi";
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

  if (!isConnected) return null;

  autoReset(address);

  async function sendRitual(type, msg) {
    if (isCooldown(type, address)) {
      alert(`You already used ${type} today`);
      return;
    }

    try {
      const txHash = await writeContractAsync({
        address: CONTRACT,
        abi: ABI,
        functionName: "performRitual",
        args: [msg],
        value: BigInt(fee.toString()),
        gas: BigInt(250000)
      });

      // TX sukses -> baru cooldown
      mark(type, address);
    } catch (err) {
      console.error(err);
      alert("Transaction failed or rejected.");
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      
      {/* 🔥 BUTTON ROW */}
      <div className="row" style={{ marginBottom: 10 }}>
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

      {/* 🔵 FEE */}
      <div style={{ opacity: 0.7, marginBottom: 6 }}>
        Fee: {fee ? ethers.formatEther(fee) : "..."} ETH
      </div>

      {/* 🔥🔥 FIXED → COOL DOWN ALWAYS BELOW BUTTONS */}
      <div style={{ marginTop: 6, textAlign: "center" }}>
        <CooldownTimer />
      </div>

    </div>
  );
}
