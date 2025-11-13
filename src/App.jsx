// src/App.jsx
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./wagmi";

import ConnectWallet from "./components/ConnectWallet";
import RitualButtons from "./components/RitualButtons";

const queryClient = new QueryClient();

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div style={{ padding: 40, textAlign: "center" }}>
          <h1>GM Ritual Dashboard ⚡</h1>

          <ConnectWallet />

          <RitualButtons />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
