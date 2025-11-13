import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect } from "@wagmi/connectors";

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    injected(),
    walletConnect({ projectId: "bandit-temp" }),
  ],
});
