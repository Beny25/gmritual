import { useAccount, useReadContract, useWriteContract, useSwitchChain, useBalance } from "wagmi";
import { CONTRACT, ABI } from "../logic/contract";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";
import { useEffect } from "react";
import { formatEther } from "viem";

export default function RitualButtons() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();

  const { data: balance } = useBalance({
    address,
    chainId: 8453
  });

  const { data: fee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
    chainId: 8453,
  });

  const ritualFee = fee?? 330000000000n; // 0.00000033 ETH

  useEffect(() => {
    if (address) autoReset(address);
  }, [address]);

  if (!isConnected ||!address) return null;

  async function sendRitual(type, msg) {
    if (isCooldown(type, address)) return;

    try {
      if (chainId!== 8453) {
        await switchChainAsync({ chainId: 8453 });
      }

      // INI KUNCINYA BIAR GAK UNKNOWN SIGNATURE TYPE:
      // Kita kasih gas manual + skip simulasi yang bikin fail
      await writeContractAsync({
        address: CONTRACT,
        abi: ABI,
        functionName: "performRitual",
        args: [msg],
        value: ritualFee,
        chainId: 8453,
        gas: 120000n, // Gas manual biar Base gak simulasi Unknown Signature
      });

      mark(type, address);
      console.log(`${type} success: ${msg}`);

    } catch (err) {
      // Kalau saldo kurang, wallet sendiri yang akan popup "Insufficient funds"
      // Kita gak alert manual, biar natural kayak miniapp biasa
      const message = err?.shortMessage || err?.message || "";
      console.log("Ritual failed:", message);

      // Cuma log, gak block — biar wallet yang handle insufficient nya
      if (message.toLowerCase().includes("insufficient")) {
        console.log("Saldo kurang bro");
      }
    }
  }

  const feeEth = fee? formatEther(fee) : "0.00000033";
  const balEth = balance? formatEther(balance.value).slice(0, 9) : "-";

  return (
    <div className="ritual-wrapper" style={{ marginTop: 12 }}>
      <button
        onClick={() => sendRitual("GM", "GM ⚡")}
        disabled={isCooldown("GM", address) || isPending}
        className="btn gm"
      >
        {isPending? "..." : "GM Ritual 🌞"}
      </button>
      <CooldownTimer type="GM" address={address} />

      <button
        onClick={() => sendRitual("GN", "GN 🌙")}
        disabled={isCooldown("GN", address) || isPending}
        className="btn gn"
      >
        {isPending? "..." : "GN Ritual 🌙"}
      </button>
      <CooldownTimer type="GN" address={address} />

      <button
        onClick={() => sendRitual("SLEEP", "GoSleep 😴")}
        disabled={isCooldown("SLEEP", address) || isPending}
        className="btn sleep"
      >
        {isPending? "..." : "GoSleep 😴"}
      </button>
      <CooldownTimer type="SLEEP" address={address} />

      <div style={{ opacity: 0.6, marginTop: 14, fontSize: "11px", textAlign: "center", lineHeight: "1.4" }}>
        Fee: {feeEth} ETH + gas • Saldo: {balEth} ETH
        <br />
        Collector: 0x4ae7...6542 (EOA utama)
        {balance && balance.value < ritualFee + 500000000000000n && (
          <>
            <br />
            <span style={{ color: "#ff5555" }}>⚠️ Saldo kurang buat gas — top up dikit</span>
          </>
        )}
      </div>
    </div>
  );
}
