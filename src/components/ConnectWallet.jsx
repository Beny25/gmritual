import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected)
    return (
      <div style={{ textAlign: "center" }}>
        <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
        <button className="btn danger" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );

  return (
    <div style={{ textAlign: "center" }}>
      {connectors.map(c => (
        <button className="btn primary" key={c.uid} onClick={() => connect({ connector: c })}>
          Connect Wallet ({c.name})
        </button>
      ))}
    </div>
  );
}
