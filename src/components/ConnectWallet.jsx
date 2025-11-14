import { useConnect, useAccount, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const injected = connectors.find(c => c.id === "injected");
  const walletConnect = connectors.find(c => c.id === "walletConnect");

  const [hasInjectedWallet, setHasInjectedWallet] = useState(false);

  // 🔥 Detect Warpcast (Farcaster mobile app)
  const isWarpcast =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("warpcast");

  useEffect(() => {
    // Detect ANY mobile wallet injected provider
    if (
      typeof window !== "undefined" &&
      (window.ethereum ||
        window.okxwallet ||
        window.bitkeep ||
        window.bitgetWallet ||
        window.trustwallet)
    ) {
      setHasInjectedWallet(true);
    }
  }, []);

  function handleConnect() {
    // 🔥 1. AUTO-CONNECT khusus Warpcast → tidak pakai modal
    if (isWarpcast && walletConnect) {
      connect({
        connector: walletConnect,
        chainId: 8453, // Base
      });
      return;
    }

    // 🔥 2. Mobile DApp browsers → pakai injected
    if (hasInjectedWallet && injected) {
      connect({ connector: injected });
      return;
    }

    // 🔥 3. Browser biasa → buka modal WalletConnect
    connect({ connector: walletConnect });
  }

  // If connected
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

  // Default connect button
  return (
    <button className="connect-btn" onClick={handleConnect}>
      Connect Wallet
    </button>
  );
}
