import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,
      metadata: {
        name: "GMRitual",
        description: "GM Ritual App",
        url: "https://gmritual.vercel.app",
        icons: ["https://gmritual.vercel.app/icon.png"],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
});
