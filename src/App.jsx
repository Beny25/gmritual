import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi'
import ConnectWallet from './components/ConnectWallet'

const queryClient = new QueryClient()

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        
        <div style={{ padding: 40, textAlign: "center" }}>
          <h1>GM Ritual (React Version)</h1>
          <ConnectWallet />

          <div style={{ marginTop: 40 }}>
            <p style={{ opacity: 0.7 }}>UI ritual soon here...</p>
          </div>
        </div>

      </QueryClientProvider>
    </WagmiProvider>
  )
}

