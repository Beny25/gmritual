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
  <div className="footer-title">
    Built with love by <strong>Bandit Squad</strong>
  </div>

  <div>
    Contract:&nbsp;
    <a href="https://basescan.org/address/0x725Ccb4ddCB715f468b301395Dfd1b1efDb5308A" target="_blank">
      Ritual Contract
    </a>
  </div>

  <div className="footer-follow">
    👉 Follow us:
    <a href="https://warpcast.com" target="_blank">Farcaster</a>
    •
    <a href="https://x.com" target="_blank">X (Twitter)</a>
    •
    <a href="https://github.com" target="_blank">GitHub</a>
  </div>

  <div className="footer-copy">
    © 2025 GM Ritual Dashboard • On Base
  </div>
</footer>
    </>
  );
        }
