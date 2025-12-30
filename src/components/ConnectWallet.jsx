// src/components/ConnectWallet.tsx
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const injected = connectors.find(c => c.id === "injected");
  const walletConnect = connectors.find(c => c.id === "walletConnect");

  const [hasInjectedWallet, setHasInjectedWallet] = useState(false);

  // 🔥 Detect Base App
  const isBaseApp =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("basewallet"); // sesuaikan sesuai UA

  // 🔥 Detect Warpcast
  const isWarpcast =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("warpcast");

  // 🔹 Detect injected wallets
  useEffect(() => {
    if (typeof window === "undefined") return;

    const eth = window.ethereum;

    // 🚫 Warpcast inject palsu
    if (isWarpcast) {
      setHasInjectedWallet(false);
      return;
    }

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

  // 🔹 Auto-connect Base App (kalau connector ready)
  useEffect(() => {
    if (isBaseApp && !isConnected && injected) {
      connect({ connector: injected, chainId: 8453 });
    }
  }, [isBaseApp, isConnected, injected, connect]);

  // 🔘 Handle Connect
  function handleConnect() {
    if (isBaseApp && injected) {
      connect({ connector: injected, chainId: 8453 });
      return;
    }

    if (isWarpcast && walletConnect) {
      connect({ connector: walletConnect, chainId: 8453 });
      return;
    }

    if (hasInjectedWallet && injected) {
      connect({ connector: injected });
      return;
    }

    if (walletConnect) {
      connect({ connector: walletConnect });
    }
  }

  // 🔵 UI Connected
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

  // 🟦 UI Connect button
  return (
    <button className="connect-btn" onClick={handleConnect}>
      Connect Wallet
    </button>
  );
}
