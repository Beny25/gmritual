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

  const { writeContract } = useWriteContract();

  if (!isConnected) return null;

  autoReset(address); // reset otomatis UTC

  const sendRitual = (type, msg) => {
    if (isCooldown(type, address)) {
      alert(`You already used ${type} today.`);
      return;
    }

    writeContract({
      address: CONTRACT,
      abi: ABI,
      functionName: "performRitual",
      args: [msg],
      value: fee,
      gas: BigInt(250000),
    });

    mark(type, address);
  };

  return (
    <>
      <div className="row" style={{ marginTop: 4 }}>
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

      <div style={{ opacity: 0.7, marginTop: 12 }}>
        Fee: {fee ? ethers.formatEther(fee) : "..."} ETH
      </div>

      <CooldownTimer />
    </>
  );
}
