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

  // ====== Load signer from provider ======
  useEffect(() => {
    async function loadSigner() {
      if (!window.ethereum || !isConnected) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const s = await provider.getSigner();
        setSigner(s);

        const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, s);
        const feeVal = await c.fee();
        setFee(ethers.formatEther(feeVal));
      } catch (e) {
        console.error("Signer error:", e);
      }
    }

    loadSigner();
  }, [isConnected]);

  // ====== Ritual TX ======
  async function perform(type, msg) {
    if (!signer) return alert("Signer not ready");

    setLoading(true);
    try {
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const f = await c.fee();

      const tx = await c.performRitual(msg, { value: f });
      await tx.wait();

      alert(`${type} Ritual Complete!`);
    } catch (err) {
      console.error(err);
      alert("TX failed!");
    }
    setLoading(false);
  }

  // ====== UI ======
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>GM Ritual Dashboard ⚡</h1>

      {!isConnected && (
        <p style={{ opacity: 0.7 }}>Connect wallet from the button above.</p>
      )}

      {isConnected && (
        <>
          <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>

          <button onClick={() => disconnect()} style={btnRed}>
            Disconnect
          </button>

          <div style={{ marginTop: 40 }}>
            <button
              style={btn}
              disabled={loading}
              onClick={() => perform("GM", "GM ⚡")}
            >
              GM Ritual 🌞
            </button>

            <button
              style={btn}
              disabled={loading}
              onClick={() => perform("GN", "GN 🌙")}
            >
              GN Ritual 🌙
            </button>

            <button
              style={btn}
              disabled={loading}
              onClick={() => perform("SLEEP", "GoSleep 😴")}
            >
              GoSleep 😴
            </button>
          </div>

          <p style={{ marginTop: 20, opacity: 0.6 }}>
            Ritual Fee: {fee ?? "..."} ETH
          </p>
        </>
      )}
    </div>
  );
}

const btn = {
  padding: "14px 20px",
  margin: 10,
  borderRadius: 12,
  background: "#2563eb",
  color: "white",
  fontWeight: 600,
  minWidth: 160,
};

const btnRed = {
  ...btn,
  background: "#ef4444",
};
