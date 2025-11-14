import { useAccount, useConnect } from "wagmi";

export default function ConnectWallet() {
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();

  if (isConnected) return null;

  function handleConnect() {
    // Urutan prioritas:
    // 1. Injected wallet (MetaMask / Bitget / OKX / Trust)
    // 2. WalletConnect
    const injected = connectors.find(c => c.id === "injected");
    const wc = connectors.find(c => c.id === "walletConnect");

    if (injected) connect({ connector: injected });
    else if (wc) connect({ connector: wc });
    else alert("No wallet found");
  }

  return (
    <div className="connect-btn" onClick={handleConnect}>
      Connect Wallet
    </div>
  );
}
