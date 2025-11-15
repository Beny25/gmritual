import "./styles/App.css";
import ConnectWallet from "./components/ConnectWallet";
import RitualButtons from "./components/RitualButtons";

export default function App() {
  return (
    <>
      <div className="wrap">

        <img
          src="/gmbandit.jpg"
          alt="GMbandit Banner"
          style={{ maxWidth: "100%", borderRadius: 12, marginBottom: 12 }}
        />

        <div className="humor">
          This ritual costs only <strong>0.00000033 ETH</strong>.<br />
          Cheaper than your morning coffee, but blessed by onchain gods
        </div>

        <h1>GM Ritual Dashboard</h1>
        <div className="sub">Connect → Choose Ritual → Confirm TX</div>

        {/* CARD START */}
        <div className="card">

          <ConnectWallet />
          <RitualButtons />

        </div>
        {/* CARD END */}

      </div>

      {/* FOOTER HARUS DI SINI */}
      <footer className="footer">
        🟦 Built with love by <strong>Bandit Squad</strong><br />
        Contract: 
        <a href="https://basescan.org/address/0x725Ccb4ddCB715f468b301395Dfd1b1efDb5308A" target="_blank">
          Ritual Contract
        </a>
        <br /><br />

        👉 Follow us:
        <a href="https://warpcast.com/banditi" target="_blank">Farcaster</a> • <a href="https://x.com/Alidepok1" target="_blank">X (Twitter)</a> • <a href="https://github.com/beny25/GMbandit" target="_blank">GitHub</a>

        <br /><br />
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          © 2025 GM Ritual Dashboard • On Base
        </span>
      </footer>
    </>
  );
        }
