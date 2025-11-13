import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected)
    return (
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p>
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
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
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          disabled={isPending}
          onClick={() => connect({ connector })}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            background: "#2563eb",
            color: "white",
            fontWeight: 600,
            marginBottom: 10,
            minWidth: 240,
          }}
        >
          Connect Wallet ({connector.name})
        </button>
      ))}

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>
          {error.message}
        </p>
      )}
    </div>
  );
}
