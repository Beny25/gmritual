import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { simulateContract } from "wagmi/actions";
import { CONTRACT, ABI } from "../logic/contract";
import { ethers } from "ethers";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";
import { config } from "../wagmi";

export default function RitualButtons() {
  const { address, isConnected } = useAccount();
  const [lastType, setLastType] = useState(null);

  const { data: fee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
  });

  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (address) autoReset(address);
  }, [address]);

  if (!isConnected || !address) return null;

  async function sendRitual(type, msg) {
  if (!address) return;

  // 1️⃣ PASTIKAN ADA DI BASE
  try {
    await config.getClient().chain?.id;
    if (config.getClient().chain?.id !== 8453) {
      await config.getClient().switchChain({ chainId: 8453 });
    }
  } catch (e) {
    console.warn("Switch chain failed", e);
  }

  // 2️⃣ CEK COOLDOWN
  if (isCooldown(type, address)) {
    alert(`You already did ${type} today.`);
    return;
  }

  // 3️⃣ VALUE (fee) fallback
  const value = fee ? BigInt(fee.toString()) : 0n;

  // 4️⃣ TRY SIMULATE
  let request;
  try {
    const sim = await simulateContract(config, {
      address: CONTRACT,
      abi: ABI,
      functionName: "performRitual",
      args: [msg],
      account: address,
      value,
    });

    request = sim.request;

  } catch (err) {
    console.warn("Simulation failed, using fallback gas");

    request = {
      address: CONTRACT,
      abi: ABI,
      functionName: "performRitual",
      args: [msg],
      value,
      gas: 250000n,
    };
  }

  // 5️⃣ KIRIM TX
  try {
    await writeContractAsync(request);
    mark(type, address);
    setLastType(type);

  } catch (err) {
    console.error(err);
    alert("Transaction rejected or failed.");
  }
  }
  return (
    <div className="ritual-wrapper" style={{ marginTop: 10 }}>

      <div className="row" style={{ marginBottom: 12 }}>
        <button
          className={`btn gm ${isCooldown("GM", address) ? "disabled" : ""}`}
          disabled={!fee}
          onClick={() => sendRitual("GM", "GM ⚡")}
        >
          GM Ritual 🌞
        </button>

        <button
          className={`btn gn ${isCooldown("GN", address) ? "disabled" : ""}`}
          disabled={!fee}
          onClick={() => sendRitual("GN", "GN 🌙")}
        >
          GN Ritual 🌙
        </button>

        <button
          className={`btn sleep ${isCooldown("SLEEP", address) ? "disabled" : ""}`}
          disabled={!fee}
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
