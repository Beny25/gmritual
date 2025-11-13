import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connectors, connect } = useConnect()

  if (isConnected)
    return (
      <div style={{ textAlign: "center" }}>
        <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )

  return (
    <div style={{ textAlign: "center" }}>
      {connectors.map((c) => (
        <button key={c.uid} onClick={() => connect({ connector: c })}>
          Connect Wallet ({c.name})
        </button>
      ))}
    </div>
  )
}
