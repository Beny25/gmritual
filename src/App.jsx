import "./App.css";
import ConnectWallet from "./components/ConnectWallet";
import RitualButtons from "./components/RitualButtons";
import gmbandit from "./assets/gmbandit.jpg";

export default function App() {
  return (
    <div className="wrap">

      <img src={gmbandit} alt="GMbandit Banner"
        style={{ maxWidth: "100%", borderRadius: 12, marginBottom: 12 }} />

      <div style={{ color: "#1e3a8a", fontSize: 14, marginBottom: 28 }}>
        This ritual costs only <strong>0.00000033 ETH</strong>.<br />
        Cheaper than your morning coffee, but blessed by the onchain gods
      </div>

      <h1>GM Ritual Dashboard</h1>
      <div className="sub">Connect → Choose Ritual → Confirm TX (Base Chain)</div>

      <div className="card">
        <ConnectWallet />
        <RitualButtons />
      </div>

    </div>
  );
}
