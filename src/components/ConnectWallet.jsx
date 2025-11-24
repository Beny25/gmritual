import { useConnect, useAccount, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Ambil connector
  const injected = connectors.find(c => c.id === "injected");
  const walletConnect = connectors.find(c => c.id === "walletConnect");

  // State untuk deteksi injected wallet asli
  const [hasInjectedWallet, setHasInjectedWallet] = useState(false);

  // 🔥 Deteksi Base App (penting!)
  const isBaseApp =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("base wallet");

  // 🔥 Deteksi Warpcast (Farcaster Mini-App)
  const isWarpcast =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("warpcast");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const eth = window.ethereum;

    // 🚫 Warpcast inject ethereum palsu → jangan dipakai
    if (isWarpcast) {
      setHasInjectedWallet(false);
      return;
    }

    // ✔ Injected wallet yang bener (OKX, MetaMask, Bitget, Trust)
    if (
      eth?.isMetaMask ||
      eth?.isOkxWallet ||
      eth?.isBitget ||
      eth?.isTrust ||
      window.okxwallet ||
      window.bitgetWallet ||
      window.trustwallet
    ) {
      setHasInjectedWallet(true);
    }
  }, [isWarpcast]);

  // ===========================================================
  // ⭐ Auto-connect khusus Base App
  // ===========================================================
  useEffect(() => {
    if (isBaseApp && !isConnected && injected) {
      connect({ connector: injected, chainId: 8453 });
    }
  }, [isBaseApp, isConnected, injected, connect]);

  // ===========================================================
  // 🔘 LOGIKA FINAL CONNECT BUTTON
  // ===========================================================
  function handleConnect() {
    // 1️⃣ Base App → selalu injected (tanpa modal)
    if (isBaseApp && injected) {
      connect({ connector: injected, chainId: 8453 });
      return;
    }

    // 2️⃣ Warpcast → SELALU WalletConnect
    if (isWarpcast && walletConnect) {
      connect({ connector: walletConnect, chainId: 8453 });
      return;
    }

    // 3️⃣ Mobile DApp browser → injected
    if (hasInjectedWallet && injected) {
      connect({ connector: injected });
      return;
    }

    // 4️⃣ Browser biasa → WalletConnect
    connect({ connector: walletConnect });
  }

  // ===========================================================
  // 🔵 UI: Sudah connect
  // ===========================================================
  if (isConnected) {
    return (
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px", opacity: 0.7 }}>
          Connected: {address.slice(0, 6)}…{address.slice(-4)}
        </div>

        <button className="connect-btn" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  // ===========================================================
  // 🟦 UI: Tombol connect
  // ===========================================================
  return (
    <button className="connect-btn" onClick={handleConnect}>
      Connect Wallet
    </button>
  );
}
