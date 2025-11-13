import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./logic/contract";

export default function App() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [signer, setSigner] = useState(null);
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===== Load signer =====
  useEffect(() => {
    async function load() {
      if (!window.ethereum || !isConnected) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const s = await provider.getSigner();
        setSigner(s);

        const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, s);
        const f = await c.fee();
        setFee(ethers.formatEther(f));
      } catch (e) {
        console.error("Signer load error:", e);
      }
    }

    load();
  }, [isConnected]);

  // ============================================================
  // 🔥 RITUAL WITH GAS ESTIMATE (NO FAIL WHEN NO ETH)
  // ============================================================
  async function ritual(type, msg) {
    if (!signer) return alert("Signer not ready");

    setLoading(true);

    try {
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const f = await c.fee();

      // --------------------------------------------------------
      // ⭐ 1) ESTIMATE GAS FIRST (SAFE CHECK)
      // --------------------------------------------------------
      const gas = await signer.estimateGas({
        to: CONTRACT_ADDRESS,
        value: f,
        data: c.interface.encodeFunctionData("performRitual", [msg]),
      }).catch(err => err);

      // ❌ If estimation returned error:
      if (gas instanceof Error) {
        if (gas.message.includes("insufficient funds")) {
          alert("Not enough ETH to pay for ritual + gas.");
        } else {
          alert("Cannot estimate gas: " + gas.message);
        }
        setLoading(false);
        return;
      }

      // --------------------------------------------------------
      // ⭐ 2) SEND TX — because estimation was successful
      // --------------------------------------------------------
      const tx = await c.performRitual(msg, { value: f, gasLimit: gas });

      alert("TX sent… waiting confirmation");
      await tx.wait();
      alert(`${type} Ritual Completed!`);
    } catch (e) {
      console.error(e);
      alert("TX failed: " + e.message);
    }

    setLoading(false);
  }

  // ============================================================

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>GM Ritual Dashboard ⚡</h1>

      {!isConnected && (
        <p style={{ opacity: 0.7 }}>Connect your wallet first 🙏</p>
      )}

      {isConnected && (
        <>
          <p>
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </p>

          <button onClick={() => disconnect()} style={btnRed}>
            Disconnect
          </button>

          <div style={{ marginTop: 40 }}>
            <button
              style={btn}
              disabled={loading}
              onClick={() => ritual("GM", "GM ⚡")}
            >
              GM Ritual 🌞
            </button>

            <button
              style={btn}
              disabled={loading}
              onClick={() => ritual("GN", "GN 🌙")}
            >
              GN Ritual 🌙
            </button>

            <button
              style={btn}
              disabled={loading}
              onClick={() => ritual("SLEEP", "GoSleep 😴")}
            >
              GoSleep 😴
            </button>
