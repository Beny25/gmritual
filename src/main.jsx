import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./wagmi.js";

// ⭐ Coinbase OnchainKit
import { OnchainKitProvider, walletActions } from "@coinbase/onchainkit";
import { base } from "wagmi/chains";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <OnchainKitProvider
      apiKey={import.meta.env.VITE_COINBASE_API_KEY || ""}
      chains={[base]}
      walletConnectVersion="2"
      walletActions={walletActions}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </OnchainKitProvider>
  </React.StrictMode>
);
