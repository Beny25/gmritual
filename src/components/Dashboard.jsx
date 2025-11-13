import "../styles/dashboard.css";
import ConnectWallet from "./ConnectWallet";
import RitualButtons from "./RitualButtons";
import AddressBar from "./AddressBar";
import { useAccount } from "wagmi";

export default function Dashboard() {
  const { address, isConnected } = useAccount();

  return (
    <div className="wrap">

      <img src="/gmbandit.jpg" alt="GMbandit Banner" className="banner" />

      <div className="humor">
        This ritual costs only <strong>0.00000033 ETH</strong>.<br />
        Cheaper than your morning coffee, but blessed by the onchain gods
      </div>

      <h1>GM Ritual Dashboard</h1>
      <p className="sub">Connect → Choose Ritual → Confirm TX (Base 8453)</p>

      <div className="card">
        
        <ConnectWallet />

        {isConnected && <AddressBar address={address} />}

        <RitualButtons address={address} isConnected={isConnected} />

        <div className="foot">
          Want your own contract?{" "}
          <a className="link" onClick={() => alert("Deploy coming soon 🚧")}>
            Deploy (Coming Soon) 🚧
          </a>
        </div>
      </div>
    </div>
  );
}
