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
      alert("Fee not loaded yet.");
      return;
    }

    if (isCooldown(type, address)) {
      alert(`You already did ${type} today.`);
      return;
    }

    setLoading(true);

    try {
      // Convert walletClient → ethers signer
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      // Force Base chain
      if (chainId !== 8453) {
        await walletClient.switchChain({ chainId: 8453 });
      }

      // Encode calldata
      const iface = new ethers.Interface(ABI);
      const encoded = iface.encodeFunctionData("performRitual", [msg]);

      // FIX GAS LIMIT → wallet estimasi gas-nya bug
      const tx = {
        to: CONTRACT,
        data: encoded,
        value: fee,
        gas: 65000n        // FIXED & AMAN
      };

      // Send TX to wallet
      await signer.sendTransaction(tx);

      mark(type, address);
      setLastType(type);

    } catch (e) {
      console.error(e);
      alert("Transaction failed or rejected.");
    }

    setLoading(false);
  }

  return (
    <div className="ritual-wrapper" style={{ marginTop: 10 }}>
      <div className="row" style={{ marginBottom: 12 }}>

        <button
          className={`btn gm ${isCooldown("GM", address) ? "disabled" : ""}`}
          disabled={loading || isCooldown("GM", address)}
          onClick={() => sendRitual("GM", "GM ⚡")}
        >
          GM Ritual 🌞
        </button>

        <button
          className={`btn gn ${isCooldown("GN", address) ? "disabled" : ""}`}
          disabled={loading || isCooldown("GN", address)}
          onClick={() => sendRitual("GN", "GN 🌙")}
        >
          GN Ritual 🌙
        </button>

        <button
          className={`btn sleep ${isCooldown("SLEEP", address) ? "disabled" : ""}`}
          disabled={loading || isCooldown("SLEEP", address)}
          onClick={() => sendRitual("SLEEP", "GoSleep 😴")}
        >
          GoSleep 😴
        </button>
      </div>

      <div style={{ opacity: 0.7 }}>
        Fee: {fee ? ethers.formatEther(fee) : "..."} ETH
      </div>

      <div style={{ marginTop: 10, textAlign: "center" }}>
        <CooldownTimer type={lastType} address={address} />
      </div>
    </div>
  );
                                            }
