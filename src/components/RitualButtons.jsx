import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWalletClient } from "wagmi";
import { CONTRACT, ABI } from "../logic/contract";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";
import { ethers } from "ethers";

export default function RitualButtons() {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastType, setLastType] = useState(null);

  // Load fee once
  useEffect(() => {
    async function loadFee() {
      try {
        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        const c = new ethers.Contract(CONTRACT, ABI, provider);
        const f = await c.fee();
        setFee(f);
      } catch (e) {
        console.error("Fee load error:", e);
      }
    }
    loadFee();
  }, []);

  // Reset cooldown per address
  useEffect(() => {
    if (address) autoReset(address);
  }, [address]);

  if (!isConnected || !address || !walletClient) return null;

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
    // Pastikan di Base
    if (chainId !== 8453) {
      await walletClient.switchChain({ chainId: 8453 });
    }

    const iface = new ethers.Interface(ABI);

    await walletClient.sendTransaction({
      to: CONTRACT,
      data: iface.encodeFunctionData("performRitual", [msg]),
      value: fee,
      gas: 65000n, // aman dan cukup
    });

    mark(type, address);
    setLastType(type);

  } catch (err) {
    console.error(err);
    alert("Transaction failed or rejected.");
  }
  }

return (
  <div className="ritual-wrapper" style={{ marginTop: 10 }}>

    {/* GM BUTTON */}
    <button
      className={`btn gm ${isCooldown("GM", address) ? "disabled" : ""}`}
      onClick={() => sendRitual("GM", "GM ⚡")}
    >
      GM Ritual 🌞
    </button>
    <CooldownTimer type="GM" address={address} />


    {/* GN BUTTON */}
    <button
      className={`btn gn ${isCooldown("GN", address) ? "disabled" : ""}`}
      onClick={() => sendRitual("GN", "GN 🌙")}
    >
      GN Ritual 🌙
    </button>
    <CooldownTimer type="GN" address={address} />


    {/* Sleep BUTTON */}
    <button
      className={`btn sleep ${isCooldown("SLEEP", address) ? "disabled" : ""}`}
      onClick={() => sendRitual("SLEEP", "GoSleep 😴")}
    >
      GoSleep 😴
    </button>
    <CooldownTimer type="SLEEP" address={address} />

    {/* FEE DISPLAY */}
<div style={{ opacity: 0.7, marginTop: 20 }}>
  Fee: {fee ? ethers.formatEther(fee) : "..."} ETH
</div>

</div>
);
                  
