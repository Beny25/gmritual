import { useConnect, useAccount, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const injected = connectors.find(c => c.id === "injected");
  const walletConnect = connectors.find(c => c.id === "walletConnect");

  const [hasInjectedWallet, setHasInjectedWallet] = useState(false);

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
    if (hasInjectedWallet && injected) {
      // Force injected for mobile DApp browsers
      connect({ connector: injected });
    } else {
      // Fallback for normal browsers
      connect({ connector: walletConnect });
    }
  }

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

  return (
    <button className="connect-btn" onClick={handleConnect}>
      Connect Wallet
    </button>
  );
}
