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

  // 🔥 Deteksi Warpcast (Farcaster Mini-App)
  const isWarpcast =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("warpcast");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const eth = window.ethereum;

    // 🚫 STOP: Warpcast sering inject ethereum palsu → jangan dianggap wallet
    if (isWarpcast) {
      setHasInjectedWallet(false);
      return;
    }

    // ✔ Deteksi wallet injected beneran (MetaMask / OKX / Bitget / Trust / TP)
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

  // 🔥 LOGIKA FINAL CONNECT
  function handleConnect() {
    // 1️⃣ Warpcast → SELALU pakai WalletConnect
    if (isWarpcast && walletConnect) {
      connect({ connector: walletConnect, chainId: 8453 });
      return;
    }

    // 2️⃣ Mobile DApp Browser → pakai injected
    if (hasInjectedWallet && injected) {
      connect({ connector: injected });
      return;
    }

    // 3️⃣ Browser biasa → modal WalletConnect
    connect({ connector: walletConnect });
  }

  // 🔵 Jika sudah connect
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

  // 🟦 Tombol connect default
  return (
    <button className="connect-btn" onClick={handleConnect}>
      Connect Wallet
    </button>
  );
}
