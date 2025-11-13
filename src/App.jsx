import { WagmiConfig } from "wagmi";
import { config } from "./wagmi";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <WagmiConfig config={config}>
      <Dashboard />
    </WagmiConfig>
  );
}
