// src/components/ConnectWallet.jsx
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (!connectors.length) {
    return <p style={{ textAlign: "center" }}>No wallet connectors found</p>;
  }

  if (isConnected)
    return (
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>

        <button
          onClick={() => disconnect()}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            background: "#ef4444",
            color: "white",
            fontWeight: 600,
          }}
        >
          Disconnect
        </button>
      </div>
    );

  return (
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      {connectors.map((c) => (
        <button
          key={c.uid}
          onClick={() => connect({ connector: c })}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            background: "#2563eb",
            color: "white",
            fontWeight: 600,
            minWidth: 240,
            marginBottom: 10,
          }}
        >
          Connect Wallet ({c.name})
        </button>
      ))}
    </div>
  );
      }
