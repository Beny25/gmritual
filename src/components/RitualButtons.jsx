import { useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useSwitchChain } from "wagmi";
import { CONTRACT, ABI } from "../logic/contract";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";
import { ethers } from "ethers";

export default function RitualButtons() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();

  // Baca fee onchain, fallback ke 0.00000033 ETH
  const { data: onchainFee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
    chainId: 8453,
  });

  const fee = onchainFee?? 330000000000n; // 0.00000033 ETH

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

      // PAKAI writeContractAsync - gak butuh walletClient lagi!
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
      // Error yang lebih jelas
      const msgError = err?.shortMessage || err?.details || err?.message || "Rejected";
      alert(`TX Failed: ${msgError}`);
    }
  }

  const isGMDisabled = isCooldown("GM", address) || isPending;
  const isGNDisabled = isCooldown("GN", address) || isPending;
  const isSleepDisabled = isCooldown("SLEEP", address) || isPending;

  return (
    <div className="ritual-wrapper" style={{ marginTop: 10 }}>
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

      <div style={{ opacity: 0.7, marginTop: 20 }}>
        Fee: {ethers.formatEther(fee)} ETH {onchainFee? "" : "(fallback)"}
      </div>
    </div>
  );
}
