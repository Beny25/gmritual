import { http } from 'wagmi'
import { base } from 'wagmi/chains'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { QueryClient } from '@tanstack/react-query'

export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const metadata = {
  name: 'GMritual',
  description: 'Rituals on Base',
  url: 'https://gmritual.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/0000000']
}

export const chains = [base]

export const queryClient = new QueryClient()

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  transports: {
    [base.id]: http()
  }
})
