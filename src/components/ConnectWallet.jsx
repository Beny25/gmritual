import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // DETECT WALLET DOM
  function getPreferredConnector() {
    // Bitget / Bitkeep
    if (window.bitkeep || window.bitget) {
      const c = connectors.find(x => x.id.includes("bitget"));
      if (c) return c;
    }

    // OKX Wallet
    if (window.okxwallet) {
      const c = connectors.find(x => x.id.includes("okx"));
      if (c) return c;
    }

    // MetaMask
    if (window.ethereum?.isMetaMask) {
      const c = connectors.find(x => x.id === "injected");
      if (c) return c;
    }

    // Trust Wallet
    if (window.ethereum?.isTrust) {
      const c = connectors.find(x => x.id.includes("trust"));
      if (c) return c;
    }

    // fallback → injected pertama
    return connectors.find(x => x.id === "injected") || connectors[0];
  }

  const preferred = getPreferredConnector();

  if (isConnected) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 10 }}>
          Connected: {address.slice(0,6)}…{address.slice(-4)}
        </div>

        <button className="connect-btn danger" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <button
        className="connect-btn"
        onClick={() => connect({ connector: preferred })}
      >
        Connect Wallet
      </button>
    </div>
  );
    }
