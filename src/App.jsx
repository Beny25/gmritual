import { useState } from "react";
import { WagmiConfig } from "wagmi";
import { config } from "./wagmi";
import { ethers } from "ethers";

const CONTRACT = "0x725Ccb4ddCB715f468b301395Dfd1b1efDb5308A";

const ABI = [
  "function performRitual(string calldata newMessage) external payable",
  "function fee() view returns (uint256)"
];

const BASE_CHAIN = "0x2105"; // 8453

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  const today = () => new Date().toISOString().slice(0, 10);
  const key = (type) => `cool_${type}_${account}`;
  const short = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

  const checkCooldown = (type) => {
    if (!account) return true;
    return localStorage.getItem(key(type)) === today();
  };
  const mark = (type) => localStorage.setItem(key(type), today());

  // ====== SWITCH TO BASE ======
  async function ensureBase() {
    const eth =
      window.ethereum ||
      window.okxwallet ||
      window.bitgetwallet ||
      (window.bitkeep && window.bitkeep.ethereum);

    if (!eth) {
      alert("Wallet not detected.");
      throw new Error("No wallet");
    }

    const chain = await eth.request({ method: "eth_chainId" });
    if (chain === BASE_CHAIN) return;

    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN }]
      });
    } catch (e) {
      if (e.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: BASE_CHAIN,
            chainName: "Base",
            rpcUrls: ["https://mainnet.base.org"],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            blockExplorerUrls: ["https://basescan.org"]
          }]
        });
      } else throw e;
    }
  }

  // ====== CONNECT ======
  async function connect() {
    try {
      const eth =
        window.ethereum ||
        window.okxwallet ||
        window.bitgetwallet ||
        (window.bitkeep && window.bitkeep.ethereum);

      if (!eth) {
        alert("No wallet detected");
        return;
      }

      await ensureBase();

      const prov = new ethers.BrowserProvider(eth);
      const s = await prov.getSigner();
      const addr = await s.getAddress();

      setProvider(prov);
      setSigner(s);
      setAccount(addr);

    } catch (e) {
      console.error(e);
      alert("Connection failed");
    }
  }

  // ====== DISCONNECT ======
  function disconnect() {
    setProvider(null);
    setSigner(null);
    setAccount(null);
  }

  // ====== RITUAL ======
  async function ritual(type, message) {
    if (checkCooldown(type)) {
      alert(`You already did ${type} today.`);
      return;
    }

    try {
      await ensureBase();

      const c = new ethers.Contract(CONTRACT, ABI, signer);
      const fee = await c.fee();

      const tx = await c.performRitual(message, { value: fee });
      alert("TX sent… waiting");
      await tx.wait();

      mark(type);
      alert(`${type} ritual complete`);

    } catch (e) {
      console.error(e);
      alert("Ritual failed");
    }
  }

  // ================================================================
  // =========================== UI =================================
  // ================================================================

  return (
    <WagmiConfig config={config}>
      <div
        style={{
          padding: 40,
          textAlign: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #1E3A8A 0%, #60A5FA 50%, #ffffff 100%)",
        }}
      >
        <img
          src="/gmbandit.jpg"
          alt="Banner"
          style={{ maxWidth: "100%", borderRadius: 12, marginBottom: 12 }}
        />

        <div style={{ color: "#1e3a8a", fontSize: 14, marginBottom: 28 }}>
          Ritual cost: <strong>0.00000033 ETH</strong>  
          <br />
          Blessed by onchain gods.
        </div>

        <h1 style={{ marginTop: 0, marginBottom: 6 }}>GM Ritual Dashboard</h1>

        <div style={{ color: "#1f2937", marginBottom: 32 }}>
          Connect → Ritual → Confirm TX (Base 8453)
        </div>

        {/* ================= CARD ================= */}
        <div
          style={{
            background: "rgba(22,26,34,0.85)",
            border: "1px solid #1f2430",
            borderRadius: 16,
            padding: 24,
            maxWidth: 880,
            margin: "0 auto",
          }}
        >
          {/* CONNECT BUTTON */}
          <button
            className="btn"
            style={{
              background: "#2563eb",
              color: "white",
              padding: "14px 18px",
              borderRadius: 12,
              fontWeight: 600,
              minWidth: 220,
              marginBottom: 10,
            }}
            onClick={connect}
            disabled={!!account}
          >
            {account ? "Connected ✓" : "Connect Wallet"}
          </button>

          {/* DISCONNECT */}
          <button
            style={{
              background: "#ef4444",
              color: "#fff",
              padding: "14px 18px",
              borderRadius: 12,
              fontWeight: 600,
              minWidth: 220,
              marginBottom: 20,
            }}
            disabled={!account}
            onClick={disconnect}
          >
            Disconnect
          </button>

          {/* ADDRESS */}
          {account && (
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  background: "#0b1324",
                  color: "#cfe0ff",
                  padding: "10px 12px",
                  borderRadius: 12,
                  fontSize: 14,
                }}
              >
                🟢 {short(account)}
              </span>
            </div>
          )}

          {/* RITUAL BUTTONS */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>

            {/* GM */}
            <button
              disabled={!account || checkCooldown("GM")}
              onClick={() => ritual("GM", "GM ⚡")}
              style={{
                minWidth: 220,
                padding: "14px 18px",
                borderRadius: 12,
                fontWeight: 600,
                background: "#1d4ed8",
                color: "white",
                opacity: !account || checkCooldown("GM") ? 0.5 : 1,
              }}
            >
              GM Ritual 🌞
            </button>

            {/* GN */}
            <button
              disabled={!account || checkCooldown("GN")}
              onClick={() => ritual("GN", "GN 🌙")}
              style={{
                minWidth: 220,
                padding: "14px 18px",
                borderRadius: 12,
                fontWeight: 600,
                background: "#6d28d9",
                color: "white",
                opacity: !account || checkCooldown("GN") ? 0.5 : 1,
              }}
            >
              GN Ritual 🌙
            </button>

            {/* SLEEP */}
            <button
              disabled={!account || checkCooldown("SLEEP")}
              onClick={() => ritual("SLEEP", "GoSleep 😴")}
              style={{
                minWidth: 220,
                padding: "14px 18px",
                borderRadius: 12,
                fontWeight: 600,
                background: "#374151",
                color: "#cbd5e1",
                opacity: !account || checkCooldown("SLEEP") ? 0.5 : 1,
              }}
            >
              GoSleep 😴
            </button>
          </div>
        </div>
      </div>
    </WagmiConfig>
  );
}
