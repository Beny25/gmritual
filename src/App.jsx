import { WagmiConfig } from "wagmi";
import { config } from "./wagmi";

export default function App() {
  return (
    <WagmiConfig config={config}>
      <div style={{ padding: 40, textAlign: "center", color: "white" }}>
        <h1>GM Ritual (React Version)</h1>
        <p>UI under development...</p>
      </div>
    </WagmiConfig>
  );
}
