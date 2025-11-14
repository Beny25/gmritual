import { useConnect, useAccount, useDisconnect } from "wagmi";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const injected = connectors.find(c => c.id === "injected");
  const walletConnect = connectors.find(c => c.id === "walletConnect");

  function handleConnect() {
    if (injected?.ready) {
      connect({ connector: injected });
    } else {
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
