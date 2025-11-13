import { WagmiProvider, useAccount, useDisconnect, usePublicClient, useWalletClient } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi'
import { CONTRACT, ABI } from "./logic/contract"
import { useState } from "react"
import { parseEther } from "viem"

const queryClient = new QueryClient()

function RitualApp() {

  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [loading, setLoading] = useState(false)
  const [fee, setFee] = useState(null)

  // Load fee
  async function loadFee() {
    const f = await publicClient.readContract({
      address: CONTRACT,
      abi: ABI,
      functionName: "fee"
    })
    setFee(f)
  }

  if (!fee) loadFee()

  // ============ RITUAL FUNCTION (VIEM SAFE MODE) ===============
  async function ritual(type, message) {
    if (!walletClient) return alert("Wallet not connected")

    setLoading(true)

    try {
      // 1. Simulate TX (tidak kirim dulu)
      const simulation = await publicClient.simulateContract({
        address: CONTRACT,
        abi: ABI,
        functionName: "performRitual",
        args: [message],
        value: fee
      })

      // 2. Kalau simulasi berhasil → kirim TX
      const hash = await walletClient.writeContract(simulation.request)

      alert("TX sent! waiting confirmation…")

      await publicClient.waitForTransactionReceipt({ hash })

      alert(`${type} ritual completed!`)
    }
    catch (err) {
      console.log(err)

      if (String(err).includes("insufficient")) {
        alert("Not enough ETH to pay gas fee.")
      } else {
        alert("TX failed: " + err.message)
      }
    }

    setLoading(false)
  }

  // =================== UI =======================
  return (
    <div style={{ padding: 40, textAlign: "center" }}>

      <h1>GM Ritual Dashboard ⚡</h1>

      {!isConnected && <p>Connect wallet first</p>}
      {isConnected && <p>Connected: {address.slice(0,6)}…{address.slice(-4)}</p>}

      {isConnected && (
        <button onClick={() => disconnect()} style={{ marginBottom: 20 }}>
          Disconnect
        </button>
      )}

      {isConnected && (
        <div>
          <button disabled={loading} onClick={() => ritual("GM","GM ⚡")}>
            GM Ritual 🌞
          </button>

          <button disabled={loading} onClick={() => ritual("GN","GN 🌙")}>
            GN Ritual 🌙
          </button>

          <button disabled={loading} onClick={() => ritual("SLEEP","GoSleep 😴")}>
            GoSleep 😴
          </button>
        </div>
      )}

      <p style={{ marginTop: 20, opacity: 0.7 }}>
        Ritual fee: {fee ? Number(fee) / 1e18 : "..."} ETH
      </p>

    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RitualApp />
      </QueryClientProvider>
    </WagmiProvider>
  )
      }
