import { useEffect, useState } from "react";
import { WagmiConfig } from "wagmi";
import { config } from "./wagmi";
import { ethers } from "ethers";

const CONTRACT = "0x725Ccb4ddCB715f468b301395Dfd1b1efDb5308A";

const ABI = [
  "function performRitual(string calldata newMessage) external payable",
  "function fee() view returns (uint256)"
];

const BASE_CHAIN = "0x2105";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  // ===== UI states =====
  const [gmDisabled, setGmDisabled] = useState(true);
  const [gnDisabled, setGnDisabled] = useState(true);
  const [sleepDisabled, setSleepDisabled] = useState(true);

  // ===== helpers =====
  const short = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

  const today = () => new Date().toISOString().slice(0, 10);
  const key = (type) => `cool_${type}_${account}`;

  const checkCooldown = (type) => {
    if (!account) return true;
    return localStorage.getItem(key(type)) === today();
  };

  const mark = (type) => localStorage.setItem(key(type), today());

  const refreshButtons = () => {
    setGmDisabled(checkCooldown("GM"));
    setGnDisabled(checkCooldown("GN"));
    setSleepDisabled(checkCooldown("SLEEP"));
  };

  // ====== Chain Switch ======
  async function ensureBase() {
    const eth = window.ethereum || window.okxwallet || window.bitgetwallet || (window.bitkeep && window.bitkeep.ethereum);
    if (!eth) throw new Error("No wallet");

    const chainId = await eth.request({ method: "eth_chainId" });
    if (chainId === BASE_CHAIN) return;

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
            nativeCurrency: { name: "Base Ether", symbol: "ETH", decimals: 18 },
            blockExplorerUrls: ["https://basescan.org"]
          }]
        });
      } else {
        throw e;
      }
    }
  }

  // ====== Connect ======
  async function connect() {
    try {
      const eth = window.ethereum || window.okxwallet || window.bitgetwallet || (window.bitkeep && window.bitkeep.ethereum);

      if (!eth) {
        alert("Wallet not detected. Use MetaMask/Bitget/OKX.");
        return;
      }

      await ensureBase();

      const prov = new ethers.providers.Web3Provider(eth, "any");
      setProvider(prov);

      await prov.send("eth_requestAccounts", []);
      const signer = prov.getSigner();
      setSigner(signer);

      const addr = await signer.getAddress();
      setAccount(addr);

      refreshButtons();

      // wallet listeners
      eth.on?.("accountsChanged", (acc) => {
        if (!acc || acc.length === 0) {
          disconnect();
          return;
        }
        setAccount(acc[0]);
        refreshButtons();
      });

      eth.on?.("chainChanged", (c) => {
        if (c !== BASE_CHAIN) disconnect();
      });

    } catch (err) {
      console.error(err);
      alert("Connection failed");
    }
  }

  // ====== Disconnect ======
  function disconnect() {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setGmDisabled(true);
    setGnDisabled(true);
    setSleepDisabled(true);
  }

  // ====== Ritual ======
  async function ritual(type, message) {
    if (checkCooldown(type)) {
      alert(`You already did ${type} today.`);
      return;
    }

    const eth = window.ethereum || window.okxwallet || window.bitgetwallet || (window.bitkeep && window.bitkeep.ethereum);
    if (eth?.isBaseWallet || eth?.isSmartAccount) {
      alert("Base App not supported. Use Bitget/MetaMask/OKX.");
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
      refreshButtons();
      alert(`${type} ritual complete`);
    } catch (e) {
      console.error(e);
      alert("Ritual failed");
    }
  }

  return (
    <WagmiConfig config={config}>
      <div className="wrap">

        <h1 style={{ textAlign: "center", marginTop: 100 }}>GM Ritual Dashboard</h1>

        {!account && (
          <button className="btn primary" onClick={connect}>
            Connect Wallet
          </button>
        )}

        {account && (
          <>
            <p style={{ marginTop: 10 }}>Connected: {short(account)}</p>

            <button className="btn danger" onClick={disconnect}>
              Disconnect
            </button>

            <div className="row" style={{ marginTop: 24 }}>
              <button className="btn gm" disabled={gmDisabled} onClick={() => ritual("GM", "GM ⚡")}>
                GM Ritual 🌞
              </button>

              <button className="btn gn" disabled={gnDisabled} onClick={() => ritual("GN", "GN 🌙")}>
                GN Ritual 🌙
              </button>

              <button className="btn sleep" disabled={sleepDisabled} onClick={() => ritual("SLEEP", "GoSleep 😴")}>
                GoSleep 😴
              </button>
            </div>
          </>
        )}
      </div>
    </WagmiConfig>
  );
  }    if (!eth) {
      alert("Wallet not detected. Use MetaMask/Bitget/OKX.");
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
          params: [
            {
              chainId: BASE_CHAIN,
              chainName: "Base",
              rpcUrls: ["https://mainnet.base.org"],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: ["https://basescan.org"]
            }
          ]
        });
      } else throw e;
    }
  }

  // ========= CONNECT ==========
  async function connect() {
    try {
      await ensureBase();
      const eth = window.ethereum;
      const prov = new ethers.providers.Web3Provider(eth, "any");
      await prov.send("eth_requestAccounts", []);
      const s = prov.getSigner();
      const addr = await s.getAddress();

      setProvider(prov);
      setSigner(s);
      setAccount(addr);
    } catch (e) {
      console.error(e);
      alert("Connection failed");
    }
  }

  function disconnect() {
    setAccount(null);
    setProvider(null);
    setSigner(null);
  }

  // ========= RITUAL ==========
  async function ritual(type, message) {
    if (checkCooldown(type)) {
      alert("You already did " + type + " today!");
      return;
    }

    try {
      await ensureBase();
      const instance = new ethers.Contract(CONTRACT, ABI, signer);
      const fee = await instance.fee();

      const tx = await instance.performRitual(message, { value: fee });
      alert("TX sent... waiting");
      await tx.wait();

      mark(type);
      alert(type + " ritual completed!");
    } catch (e) {
      console.error(e);
      alert("Ritual failed");
    }
  }

  // ========= UI ==========
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
        {/* Banner */}
        <img
          src="/gmbandit.jpg"
          alt="Banner"
          style={{ maxWidth: "100%", borderRadius: 12, marginBottom: 12 }}
        />

        <div style={{ color: "#1e3a8a", fontSize: 14, marginBottom: 28 }}>
          This ritual costs only <strong>0.00000033 ETH</strong>.<br />
          Cheaper than your coffee, but blessed by the onchain gods.
        </div>

        <h1 style={{ marginTop: 0, marginBottom: 6 }}>GM Ritual Dashboard</h1>
        <div style={{ color: "#1f2937", marginBottom: 32 }}>
          Connect → Choose Ritual → Confirm TX (Base Chain 8453)
        </div>

        {/* Card */}
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
          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <button
              className="btn"
              style={{
                background: "#2563eb",
                color: "white",
                padding: "14px 18px",
                borderRadius: 12,
                fontWeight: 600,
                minWidth: 220,
              }}
              onClick={connect}
              disabled={!!account}
            >
              {account ? "Connected ✓" : "Connect Wallet"}
            </button>

            <button
              style={{
                background: "#ef4444",
                color: "#fff",
                padding: "14px 18px",
                borderRadius: 12,
                fontWeight: 600,
                minWidth: 220,
                opacity: account ? 1 : 0.5,
              }}
              disabled={!account}
              onClick={disconnect}
            >
              Disconnect
            </button>
          </div>

          {/* Address */}
          {account && (
            <div
              style={{
                margin: "12px 0 18px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#0b1324",
                  border: "1px solid #1f2a44",
                  color: "#cfe0ff",
                  padding: "10px 12px",
                  borderRadius: 12,
                  fontSize: 14,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: "#16a34a",
                    display: "inline-block",
                  }}
                />
                {short(account)}
              </span>
            </div>
          )}

          {/* Ritual Buttons */}
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
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

        <div style={{ marginTop: 32, color: "#9aa4b2", fontSize: 14 }}>
          🟦 Built with love by <strong>Bandit Skuad</strong>
          <br />
          Contract:{" "}
          <a
            href="https://basescan.org/address/0x725Ccb4ddCB715f468b301395Dfd1b1efDb5308A"
            target="_blank"
            style={{ color: "#7aa2ff" }}
          >
            Ritual Contract
          </a>{" "}
          |{" "}
          <a
            href="https://basescan.org/address/0xb9C0b964E223D0058cdFEB445B4506415117b055"
            target="_blank"
            style={{ color: "#7aa2ff" }}
          >
            Factory Contract
          </a>
          <br />
          <a
            href="https://warpcast.com/banditi"
            target="_blank"
            style={{ color: "#7aa2ff" }}
          >
            Farcaster
          </a>{" "}
          •{" "}
          <a
            href="https://x.com/Alidepok1"
            target="_blank"
            style={{ color: "#7aa2ff" }}
          >
            Twitter
          </a>{" "}
          •{" "}
          <a
            href="https://github.com/beny25/GMbandit"
            target="_blank"
            style={{ color: "#7aa2ff" }}
          >
            GitHub
          </a>
          <br />
          <span style={{ fontSize: 12, color: "#5c677a" }}>
            © 2025 GMbandit • Ritual Ready • On Base
          </span>
        </div>
      </div>
    </WagmiConfig>
  );
}
