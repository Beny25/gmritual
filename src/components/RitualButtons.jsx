import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useSwitchChain, useBalance, usePublicClient } from "wagmi";
import { CONTRACT, ABI } from "../logic/contract";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";
import { ethers } from "ethers";

export default function RitualButtons() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient({ chainId: 8453 });

  const { data: balance } = useBalance({ address, chainId: 8453 });
  const [gasCost, setGasCost] = useState(0n);

  const { data: onchainFee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
    chainId: 8453,
  });

  const fee = onchainFee?? 330000000000n; // 0.00000033

  // AUTO BACA GAS REAL DARI BASE RPC
  useEffect(() => {
    async function getGas() {
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
        const price = await publicClient.getGasPrice();
        const realCost = gas * price; // ini biasanya cuma 0.0000002 - 0.0000005 di Base
        setGasCost(realCost);
        console.log("Real gas:", ethers.formatEther(realCost));
      } catch (e) {
        // Kalau estimate gagal gara2 transfer issue kemarin, fallback murah
        setGasCost(300000000000000n); // 0.0000003 ETH aja, bukan 0.00005
      }
    }
    getGas();
  }, [address, publicClient, fee]);

  useEffect(() => { if (address) autoReset(address); }, [address]);

  if (!isConnected ||!address) return null;

  const total = fee + gasCost;
  const isPoor = balance? balance.value < total : false;

  async function sendRitual(type, msg) {
    if (isCooldown(type, address)) {
      alert(`Udah ${type} hari ini bro, cooldown 24 jam!`);
      return;
    }

    // ALERT OTOMATIS KALO FEE + GAS GAK CUKUP
    if (isPoor) {
      alert(
        `❌ ETH lu gak cukup bro!\n\n` +
        `Ritual Fee: ${ethers.formatEther(fee)} ETH\n` +
        `Gas: ~${ethers.formatEther(gasCost)} ETH (auto)\n` +
        `Total butuh: ~${ethers.formatEther(total)} ETH\n` +
        `Saldo lu: ${ethers.formatEther(balance.value)} ETH\n\n` +
        `Isi dulu dikit di Base.`
      );
      return;
    }

    try {
      if (chainId!== 8453) await switchChainAsync({ chainId: 8453 });
      await writeContractAsync({
        address: CONTRACT,
        abi: ABI,
        functionName: "performRitual",
        args: [msg],
        value: fee,
        chainId: 8453,
      });
      mark(type, address);
      alert(`${type} Success! ✨`);
    } catch (err) {
      const msgErr = err?.shortMessage || err?.message || "Rejected";
      alert(`Gagal: ${msgErr}`);
    }
  }

  return (
    <div className="ritual-wrapper" style={{ marginTop: 10 }}>
      {/* INI ALERT OTOMATISNYA - CUMA MUNCUL KALO GAK CUKUP */}
      {isPoor && balance && (
        <div style={{
          background: "#ff3333", color: "white", padding: "8px 12px",
          borderRadius: "8px", marginBottom: "12px", fontSize: "13px", fontWeight: "bold"
        }}>
          ⚠️ Saldo kurang! Butuh ~{ethers.formatEther(total).slice(0, 10)} ETH, lu punya {ethers.formatEther(balance.value).slice(0, 10)} ETH
        </div>
      )}

      <button className={`btn gm`} onClick={() => sendRitual("GM", "GM ⚡")} disabled={isCooldown("GM", address) || isPending}>
        {isPending? "..." : "GM Ritual 🌞"}
      </button>
      <CooldownTimer type="GM" address={address} />

      <button className={`btn gn`} onClick={() => sendRitual("GN", "GN 🌙")} disabled={isCooldown("GN", address) || isPending}>
        {isPending? "..." : "GN Ritual 🌙"}
      </button>
      <CooldownTimer type="GN" address={address} />

      <button className={`btn sleep`} onClick={() => sendRitual("SLEEP", "GoSleep 😴")} disabled={isCooldown("SLEEP", address) || isPending}>
        {isPending? "..." : "GoSleep 😴"}
      </button>
      <CooldownTimer type="SLEEP" address={address} />

      <div style={{ opacity: 0.6, marginTop: 15, fontSize: "11px" }}>
        Fee auto: {ethers.formatEther(fee)} + gas ~{ethers.formatEther(gasCost).slice(0, 10)} | Saldo: {balance? ethers.formatEther(balance.value).slice(0, 8) : "-"}
      </div>
    </div>
  );
}
