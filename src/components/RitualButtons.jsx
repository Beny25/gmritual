import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { simulateContract, getConfig } from "wagmi/actions";
import { CONTRACT, ABI } from "../logic/contract";
import { ethers } from "ethers";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";

export default function RitualButtons() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [lastType, setLastType] = useState(null);

  const wagmiConfig = getConfig();

  const { data: fee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
  });

  useEffect(() => {
    if (address) autoReset(address);
  }, [address]);

  if (!isConnected || !address) return null;

  async function sendRitual(type, msg) {
    if (!fee) {
      alert("Contract fee not loaded yet.");
      return;
    }

    if (isCooldown(type, address)) {
      alert(`You already did ${type} today.`);
      return;
    }

    try {
      let request;

      // Try gas simulation
      try {
        const sim = await simulateContract(wagmiConfig, {
          address: CONTRACT,
          abi: ABI,
          functionName: "performRitual",
          args: [msg],
          value: fee,              // Wagmi v2 expects bigint
          account: address,
        });

        request = sim.request;
      } catch (err) {
        console.warn("Simulation failed → fallback gas");

        request = {
          address: CONTRACT,
          abi: ABI,
          functionName: "performRitual",
          args: [msg],
          value: fee,
          gas: BigInt(250000),
          account: address,
        };
      }

      const tx = await writeContractAsync(request);

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
