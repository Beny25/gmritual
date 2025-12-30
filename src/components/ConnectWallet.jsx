// src/components/ConnectWallet.tsx
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
    navigator.userAgent.toLowerCase().includes("base");

  // 🔥 Deteksi Warpcast (Farcaster Mini-App)
  const isWarpcast =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("warpcast");

  // 🔹 Deteksi injected wallet asli
  useEffect(() => {
    if (typeof window === "undefined") return;

    const eth = window.ethereum;

    if (isWarpcast) {
      setHasInjectedWallet(false);
      return;
    }

    if (
      eth?.isMetaMask ||
      eth?.isOkxWallet ||
      eth?.isBitget ||
      eth?.isTrust ||
      window.okxwallet
      window.bitgetWallet
      window.trustwallet

    ) {
      setHasInjectedWallet(true);
    }
  }, [isWarpcast]);

  // 🔹 Auto-connect Base App (tunggu injected siap)
  useEffect(() => {
    if (!injected) return; // tunggu connector ready

    console.log(
      "[ConnectWallet] Auto-connect check:",
      { isBaseApp, isConnected, injected }
    );

    if (isBaseApp && !isConnected) {
      console.log("[ConnectWallet] Attempting auto-connect Base App...");
      connect({ connector: injected, chainId: 8453 }).catch(err => {
        console.error("[ConnectWallet] Auto-connect failed:", err);
      });
    }
  }, [isBaseApp, isConnected, injected, connect]);

  // 🔹 Handle tombol connect
  function handleConnect() {
    // 1️⃣ Base App → selalu injected
    if (isBaseApp && injected) {
      connect({ connector: injected, chainId: 8453 });
      return;
    }

    // 2️⃣ Warpcast → WalletConnect
    if (isWarpcast && walletConnect) {
      connect({ connector: walletConnect, chainId: 8453 });
      return;
    }

    // 3️⃣ Mobile DApp → injected
    if (hasInjectedWallet && injected) {
      connect({ connector: injected });
      return;
    }

    // 4️⃣ Browser biasa → WalletConnect
    if (walletConnect) {
      connect({ connector: walletConnect });
      return;
    }

    console.warn("[ConnectWallet] No available connector to connect");
  }

  // 🔵 UI: sudah connect
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

  // 🟦 UI: tombol connect
  return (
    <button className="connect-btn" onClick={handleConnect}>
      Connect Wallet
    </button>
  );
}



