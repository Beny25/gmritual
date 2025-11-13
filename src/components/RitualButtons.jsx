import { useAccount, useWalletClient } from "wagmi";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT = "0x725Ccb4ddCB715f468b301395Dfd1b1efDb5308A";

const ABI = [
  "function performRitual(string calldata newMessage) external payable",
  "function fee() view returns (uint256)"
];

export default function RitualButtons() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [fee, setFee] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (!walletClient || !isConnected) return;

    // ⭐ Convert viem walletClient → ethers signer
    const ethersProvider = new ethers.BrowserProvider(walletClient);
    ethersProvider.getSigner().then(async (signer) => {
      const c = new ethers.Contract(CONTRACT, ABI, signer);
      setContract(c);

      try {
        const f = await c.fee();
        setFee(f);
      } catch (err) {
        console.error("Fee read failed:", err);
      }
    });

  }, [walletClient, isConnected]);

  if (!isConnected) return null;

  async function sendRitual(type, message) {
    if (!contract) {
      alert("Contract not ready");
      return;
    }

    try {
      const tx = await contract.performRitual(message, { value: fee });
      alert("TX sent… waiting");
      await tx.wait();

      alert(`${type} ritual done!`);
    } catch (err) {
      console.error("TX ERROR:", err);
      alert("TX failed!");
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={() => sendRitual("GM", "GM ⚡")}>GM Ritual 🌞</button>
      <button onClick={() => sendRitual("GN", "GN 🌙")}>GN Ritual 🌙</button>
      <button onClick={() => sendRitual("SLEEP", "GoSleep 😴")}>GoSleep 😴</button>

      <p style={{ marginTop: 10 }}>
        Ritual Fee: {fee ? ethers.formatEther(fee) : "..."} ETH
      </p>
    </div>
  );
}
