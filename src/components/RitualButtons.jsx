import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useSwitchChain, useBalance } from "wagmi";
import { CONTRACT, ABI } from "../logic/contract";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";
import { ethers } from "ethers";
import { usePublicClient } from "wagmi";

export default function RitualButtons() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient({ chainId: 8453 });

  const { data: balance } = useBalance({ address, chainId: 8453 });
  const [gasEstimate, setGasEstimate] = useState(0n);

  const { data: onchainFee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
    chainId: 8453,
  });

  const fee = onchainFee?? 330000000000n; // 0.00000033 ETH fallback

  // Estimasi gas + ritual fee
  useEffect(() => {
    async function estimate() {
      if (!address ||!publicClient) return;
      try {
        const gas = await publicClient.estimateContractGas({
          address: CONTRACT,
          abi: ABI,
          functionName: "performRitual",
          args: ["GM"],
          value: fee,
          account: address,
        });
        // gas * gasPrice
        const gasPrice = await publicClient.getGasPrice();
        setGasEstimate(gas * gasPrice);
      } catch {
        // fallback kalau estimate gagal (karena transfer issue kemarin)
        setGasEstimate(50000000000000n); // ~0.00005 ETH fallback gas
      }
    }
    estimate();
  }, [address, publicClient, fee]);

  useEffect(() => {
    if (address) autoReset(address);
  }, [address]);

  if (!isConnected ||!address) return null;

  const totalNeeded = fee + gasEstimate;
  const hasEnoughBalance = balance? balance.value >= totalNeeded : false;

  async function sendRitual(type, msg) {
    if (isCooldown(type, address)) {
      alert(`You already did ${type} today. Cooldown 24h bro!`);
      return;
    }

    if (!hasEnoughBalance) {
      alert(
        `ETH lu gak cukup bro!\n\n` +
        `Butuh:\n` +
        `- Ritual Fee: ${ethers.formatEther(fee)} ETH\n` +
        `- Gas Fee: ~${ethers.formatEther(gasEstimate)} ETH\n` +
        `- Total: ~${ethers.formatEther(totalNeeded)} ETH\n\n` +
        `Saldo lu: ${balance? ethers.formatEther(balance.value) : "0"} ETH\n\n` +
        `Top up dulu minimal ${ethers.formatEther(totalNeeded)} ETH di Base.`
      );
      return;
    }

    try {
      if (chainId!== 8453) {
        await switchChainAsync({ chainId: 8453 });
      }

      await writeContractAsync({
        address: CONTRACT,
        abi: ABI,
        functionName: "performRitual",
        args: [msg],
        value: fee,
        chainId: 8453,
      });

      mark(type, address);
      alert(`${type} Ritual Success! ✨`);
    } catch (err) {
      console.error(err);
      const reason = err?.shortMessage || err?.cause?.shortMessage || err?.message || "Rejected";

      if (reason.includes("Not enough ritual fee")) {
        alert(`Fee kurang bro! Contract minta ${ethers.formatEther(fee)} ETH`);
      } else if (reason.includes("Transfer") || reason.includes("execution reverted")) {
        alert(
          `TX Reverted! Ini masalah transfer ke collector (smart wallet).\n\n` +
          `Fix cepat: ganti collector jadi EOA di BaseScan > setCollector.\n` +
          `Detail: ${reason}`
        );
      } else {
        alert(`TX Failed: ${reason}`);
      }
    }
  }

  const isGMDisabled = isCooldown("GM", address) || isPending;
  const isGNDisabled = isCooldown("GN", address) || isPending;
  const isSleepDisabled = isCooldown("SLEEP", address) || isPending;

  return (
    <div className="ritual-wrapper" style={{ marginTop: 10 }}>
      {/* ALERT BALANCE DI ATAS TOMBOL */}
      {!hasEnoughBalance && balance && (
        <div style={{
          background: "#ff4444",
          color: "white",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "15px",
          fontSize: "14px"
        }}>
          ⚠️ ETH gak cukup!<br/>
          Saldo: {ethers.formatEther(balance.value).slice(0, 8)} ETH<br/>
          Butuh: ~{ethers.formatEther(totalNeeded).slice(0, 8)} ETH (Fee + Gas)
        </div>
      )}

      <button
        className={`btn gm ${isGMDisabled? "disabled" : ""}`}
        onClick={() => sendRitual("GM", "GM ⚡")}
        disabled={isGMDisabled}
      >
        {isPending? "Processing..." : "GM Ritual 🌞"}
      </button>
      <CooldownTimer type="GM" address={address} />

      <button
        className={`btn gn ${isGNDisabled? "disabled" : ""}`}
        onClick={() => sendRitual("GN", "GN 🌙")}
        disabled={isGNDisabled}
      >
        {isPending? "Processing..." : "GN Ritual 🌙"}
      </button>
      <CooldownTimer type="GN" address={address} />

      <button
        className={`btn sleep ${isSleepDisabled? "disabled" : ""}`}
        onClick={() => sendRitual("SLEEP", "GoSleep 😴")}
        disabled={isSleepDisabled}
      >
        {isPending? "Processing..." : "GoSleep 😴"}
      </button>
      <CooldownTimer type="SLEEP" address={address} />

      <div style={{ opacity: 0.7, marginTop: 20, fontSize: "12px" }}>
        Fee: {ethers.formatEther(fee)} ETH {onchainFee? "" : "(fallback)"} | Gas: ~{ethers.formatEther(gasEstimate).slice(0, 8)} | Saldo: {balance? ethers.formatEther(balance.value).slice(0, 8) : "0"}
      </div>
    </div>
  );
}
