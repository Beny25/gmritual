// src/wagmi.js
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// ===========================================================
// 🔹 Wagmi config
// ===========================================================
export const config = createConfig({
  // 1️⃣ Chains
  chains: [base],

  // 2️⃣ Connectors
  connectors: [
    // 🔥 Mobile DApp browser (MetaMask, OKX, Bitget, TP, Trust, dsb)
    injected(),

    // 🔥 WalletConnect — termasuk Warpcast
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,
      metadata: {
        name: "GMRitual",
        description: "GM Ritual App",
        url: "https://gmritual.vercel.app",
        icons: ["https://gmritual.vercel.app/icon.png"],
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: "dark",
        mobileLinks: [
          "metamask",
          "okx",
          "rainbow",
          "trust",
          "bitget",
          "zerion",
          "safepal",
          "argent",
          "tokenpocket",
          "farcaster", // <-- penting biar Warpcast muncul
        ],
      },
    }),
  ],

  // 3️⃣ Transports
  transports: {
    [base.id]: http("https://developer-access-mainnet.base.org"),
  },
});
