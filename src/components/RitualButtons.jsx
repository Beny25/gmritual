import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWalletClient, useSwitchChain } from "wagmi";
import { CONTRACT, ABI } from "../logic/contract";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";
import { ethers } from "ethers";

export default function RitualButtons() {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient, isLoading: isClientLoading } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();

  const [fee, setFee] = useState(null);
  const [lastType, setLastType] = useState(null);

  useEffect(() => {
    async function loadFee() {
      try {
        // Pake RPC yang sama kayak wagmi biar konsisten
        const provider = new ethers.JsonRpcProvider("https://developer-access-mainnet.base.org");
        const c = new ethers.Contract(CONTRACT, ABI, provider);
        const f = await c.fee();
        setFee(f);
      } catch (e) {
        console.error("Fee load error:", e);
      }
    }
    loadFee();
  }, []);

  useEffect(() => {
    if (address) autoReset(address);
  }, [address]);

  // JANGAN return null karena walletClient — ini fix utama
  if (!isConnected ||!address) return null;

  // Kalau client masih loading, tampilin loading, jangan ilangin card
  if (isClientLoading) {
    return <div style={{ marginTop: 10, opacity: 0.7 }}>Loading wallet...</div>;
  }

  async function sendRitual(type, msg) {
    if (!fee) {
      alert("Contract fee not loaded yet. Coba refresh.");
      return;
    }
    if (!walletClient) {
      alert("Wallet belum ready, tunggu 2 detik lagi");
      return;
    }
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
        value: fee,
        // gas: 65000n, // hapus aja biar auto estimate, 65k kekecilan buat Base
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
      <button
        className={`btn gm ${isCooldown("GM", address)? "disabled" : ""}`}
        onClick={() => sendRitual("GM", "GM ⚡")}
        disabled={!fee ||!walletClient}
      >
        GM Ritual 🌞
      </button>
      <CooldownTimer type="GM" address={address} />

      <button
        className={`btn gn ${isCooldown("GN", address)? "disabled" : ""}`}
        onClick={() => sendRitual("GN", "GN 🌙")}
        disabled={!fee ||!walletClient}
      >
        GN Ritual 🌙
      </button>
      <CooldownTimer type="GN" address={address} />

      <button
        className={`btn sleep ${isCooldown("SLEEP", address)? "disabled" : ""}`}
        onClick={() => sendRitual("SLEEP", "GoSleep 😴")}
        disabled={!fee ||!walletClient}
      >
        GoSleep 😴
      </button>
      <CooldownTimer type="SLEEP" address={address} />

      <div style={{ opacity: 0.7, marginTop: 20 }}>
        Fee: {fee? ethers.formatEther(fee) : "loading..."} ETH
      </div>
    </div>
  );
}
