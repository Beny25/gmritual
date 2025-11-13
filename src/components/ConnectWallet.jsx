import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function ConnectWallet() {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();

  if (isConnected)
    return (
      <div className="row">
        <button className="btn primary disabled">Connected</button>
        <button className="btn danger" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );

  return (
    <div className="row">
      {connectors.map((c) => (
        <button
          key={c.uid}
          className="btn primary"
          onClick={() => connect({ connector: c })}
        >
          Connect Wallet ({c.name})
        </button>
      ))}
    </div>
  );
}
