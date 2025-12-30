import { useConnect, useAccount, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const injected = connectors.find(c => c.id === "injected");
  const walletConnect = connectors.find(c => c.id === "walletConnect");

  const [showPopup, setShowPopup] = useState(false);

  const isBaseApp =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("basewallet");

  const isWarpcast =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("warpcast");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const eth = window.ethereum;
    if (eth?.isMetaMask || eth?.isOkxWallet || eth?.isBitget || eth?.isTrust) {
      // ready injected wallet
    }
  }, []);

  function handleConnectClick() {
    // Base App → langsung connect
    if (isBaseApp && injected) {
      connect({ connector: injected, chainId: 8453 });
      return;
    }

    // Warpcast → langsung WalletConnect
    if (isWarpcast && walletConnect) {
      connect({ connector: walletConnect, chainId: 8453 });
      return;
    }

    // Browser biasa → munculkan popup pilih connector
    setShowPopup(true);
  }

  function connectInjected() {
    if (injected) connect({ connector: injected });
    setShowPopup(false);
  }

  function connectWalletConnect() {
    if (walletConnect) connect({ connector: walletConnect, chainId: 8453 });
    setShowPopup(false);
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
    <>
      <button className="connect-btn" onClick={handleConnectClick}>
        Connect Wallet
      </button>

      {showPopup && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            zIndex: 999,
            textAlign: "center"
          }}
        >
          <h3>Choose Wallet</h3>
          <button onClick={connectInjected} style={{ margin: 5 }}>
            Injected Wallet
          </button>
          <button onClick={connectWalletConnect} style={{ margin: 5 }}>
            WalletConnect
          </button>
          <div style={{ marginTop: 10 }}>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
