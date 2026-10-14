import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWalletClient, useSwitchChain } from "wagmi";
import { CONTRACT, ABI } from "../logic/contract";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";
import { ethers } from "ethers";

export default function RitualButtons() {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();

  // 1. Baca fee pake wagmi (lebih stabil dari ethers)
  const { data: onchainFee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
    chainId: 8453,
  });

  // Fallback: 0.00000033 ETH = 330000000000 wei
  // Biar kalau RPC error, tombol tetep bisa dipencet
  const fee = onchainFee?? 330000000000n;
  const feeReady = true; // selalu ready karena ada fallback

  useEffect(() => {
    if (address) autoReset(address);
  }, [address]);

  if (!isConnected ||!address) return null;

  async function sendRitual(type, msg) {
    if (isCooldown(type, address)) {
      alert(`You already did ${type} today.`);
      return;
    }

    try {
      if (chainId!== 8453) {
        await switchChainAsync({ chainId: 8453 });
      }

      const iface = new ethers.Interface(ABI);

      await walletClient.sendTransaction({
        to: CONTRACT,
        data: iface.encodeFunctionData("performRitual", [msg]),
        value: fee, // pake fee fallback
      });

      mark(type, address);
    } catch (err) {
      console.error(err);
      alert("Transaction failed: " + (err?.shortMessage || err?.message));
    }
  }

  const isGMDisabled = isCooldown("GM", address);
  const isGNDisabled = isCooldown("GN", address);
  const isSleepDisabled = isCooldown("SLEEP", address);

  return (
    <div className="ritual-wrapper" style={{ marginTop: 10 }}>
      <button
        className={`btn gm ${isGMDisabled? "disabled" : ""}`}
        onClick={() => sendRitual("GM", "GM ⚡")}
        disabled={isGMDisabled}
        style={{ pointerEvents: isGMDisabled? 'none' : 'auto' }}
      >
        GM Ritual 🌞
      </button>
      <CooldownTimer type="GM" address={address} />

      <button
        className={`btn gn ${isGNDisabled? "disabled" : ""}`}
        onClick={() => sendRitual("GN", "GN 🌙")}
        disabled={isGNDisabled}
        style={{ pointerEvents: isGNDisabled? 'none' : 'auto' }}
      >
        GN Ritual 🌙
      </button>
      <CooldownTimer type="GN" address={address} />

      <button
        className={`btn sleep ${isSleepDisabled? "disabled" : ""}`}
        onClick={() => sendRitual("SLEEP", "GoSleep 😴")}
        disabled={isSleepDisabled}
        style={{ pointerEvents: isSleepDisabled? 'none' : 'auto' }}
      >
        GoSleep 😴
      </button>
      <CooldownTimer type="SLEEP" address={address} />

      <div style={{ opacity: 0.7, marginTop: 20 }}>
        Fee: {ethers.formatEther(fee)} ETH {onchainFee? "" : "(fallback)"}
      </div>
    </div>
  );
}
