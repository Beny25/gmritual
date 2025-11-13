import './App.css'
import { useAccount, useDisconnect, useConnect } from 'wagmi'
import { walletConnect } from 'wagmi/connectors'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { wagmiConfig, projectId, chains } from './wagmi'

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'dark',
})

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect()

  const handleConnect = async () => {
    try {
      await connect({
        connector: walletConnect({ projectId })
      })
    } catch (err) {
      console.error('Connect error:', err)
    }
  }

  return (
    <div className="container">

      <h1>GM Ritual Dashboard</h1>

      {!isConnected ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </>
      )}
    </div>
  )
}
