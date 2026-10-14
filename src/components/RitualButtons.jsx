import { useAccount, useReadContract, useWriteContract, useSwitchChain, useBalance } from "wagmi";
import { CONTRACT, ABI } from "../logic/contract";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";
import { useEffect } from "react";
import { ethers } from "ethers";

export default function RitualButtons() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();

  const { data: balance } = useBalance({ address, chainId: 8453 });
  const { data: fee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
    chainId: 8453,
  });

  const ritualFee = fee?? 330000000000n;

  useEffect(() => { if (address) autoReset(address); }, [address]);

  if (!isConnected ||!address) return null;

  async function sendRitual(type, msg) {
    if (isCooldown(type, address)) return;

    try {
      if (chainId!== 8453) {
        await switchChainAsync({ chainId: 8453 });
      }

      // Langsung lempar ke wallet — biar wallet yang popup confirm
      // Kalau fee + gas kurang, wallet bakal auto bilang insufficient
      await writeContractAsync({
        address: CONTRACT,
        abi: ABI,
        functionName: "performRitual",
        args: [msg],
        value: ritualFee,
        chainId: 8453,
      });

      mark(type, address);
    } catch (err) {
      // Ini cuma buat log, gak alert blocking — biar kayak miniapp biasa
      console.log("Ritual failed:", err?.shortMessage || err?.message);
    }
  }

  return (
    <div className="ritual-wrapper" style={{ marginTop: 10 }}>
      <button onClick={() => sendRitual("GM", "GM ⚡")} disabled={isCooldown("GM", address) || isPending} className="btn gm">
        GM Ritual 🌞
      </button>
      <CooldownTimer type="GM" address={address} />

      <button onClick={() => sendRitual("GN", "GN 🌙")} disabled={isCooldown("GN", address) || isPending} className="btn gn">
        GN Ritual 🌙
      </button>
      <CooldownTimer type="GN" address={address} />

      <button onClick={() => sendRitual("SLEEP", "GoSleep 😴")} disabled={isCooldown("SLEEP", address) || isPending} className="btn sleep">
        GoSleep 😴
      </button>
      <CooldownTimer type="SLEEP" address={address} />

      {/* Info auto — murah, kayak yang lu mau */}
      <div style={{ opacity: 0.6, marginTop: 12, fontSize: "11px", textAlign: "center" }}>
        Fee: {fee? ethers.formatEther(fee) : "0.00000033"} ETH + gas |
        Saldo: {balance? ethers.formatEther(balance.value).slice(0, 8) : "-"} ETH
        <br/>
        {balance && balance.value < ritualFee && (
          <span style={{ color: "#ff5555" }}>⚠️ Saldo kurang buat fee — top up dikit bro</span>
        )}
      </div>
    </div>
  );
}
