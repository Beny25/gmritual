// src/components/RitualButtons.jsx
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWalletClient } from "wagmi";
import { CONTRACT, ABI } from "../logic/contract";
import { ethers } from "ethers";
import { isCooldown, mark, autoReset } from "../logic/ritual";
import CooldownTimer from "./CooldownTimer";

/**
 * Ethers-style flow:
 * - encode ABI calldata dengan ethers.Interface
 * - build tx object { to, from, value, data }
 * - call provider.wallet.request({ method: "eth_sendTransaction", params: [tx] })
 * -> wallet shows gas estimation + sign UI (wallet handles insufficient funds)
 *
 * This avoids wagmi simulate/write issues and behaves like your index.html version.
 */

export default function RitualButtons() {
  const { address, isConnected } = useAccount();
  const { data: fee, refetch: refetchFee } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "fee",
    watch: true,
  });

  const { data: walletClient } = useWalletClient();
  const [lastType, setLastType] = useState(null);

  useEffect(() => {
    if (address) {
      autoReset(address);
      // small delay so provider/connect finishes
      setTimeout(() => refetchFee && refetchFee(), 200);
    }
  }, [address]);

  if (!isConnected || !address) return null;

  const iface = new ethers.Interface(ABI);

  function toHex(value) {
    // accept BigInt, BN-like (ethers v5 BigNumber), string, number
    if (value == null) return "0x0";
    try {
      // if it's ethers BigNumber
      if (typeof value === "object" && value._hex) {
        return "0x" + BigInt(value.toString()).toString(16);
      }
      // if already bigint
      if (typeof value === "bigint") return "0x" + value.toString(16);
      // if string decimal
      if (typeof value === "string" && /^\d+$/.test(value)) {
        return "0x" + BigInt(value).toString(16);
      }
      // fallback: try Number -> BigInt
      return "0x" + BigInt(value).toString(16);
    } catch (e) {
      return "0x0";
    }
  }

  async function sendRawTx(type, message) {
    if (isCooldown(type, address)) {
      alert(`You already did ${type} today.`);
      return;
    }

    // encode calldata
    const data = iface.encodeFunctionData("performRitual", [message]);

    // value: convert fee to hex (wei)
    const valueHex = fee ? toHex(fee) : "0x0";

    // build tx
    const tx = {
      from: address,
      to: CONTRACT,
      value: valueHex,
      data,
      // omit gas so wallet estimates itself
    };

    try {
      // 1) prefer window.ethereum (injected) if exists — behaves like your index.html
      if (typeof window !== "undefined" && window.ethereum && window.ethereum.request) {
        const provider = window.ethereum;
        // ensure chain is Base (try to switch; if fails, wallet may prompt)
        try {
          const chainId = await provider.request({ method: "eth_chainId" });
          if (chainId !== "0x2105") {
            try {
              await provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x2105" }],
              });
            } catch (_) {
              // user may need to switch manually; still attempt send (wallet may prompt)
            }
          }
        } catch (e) {
          // ignore
        }

        const res = await provider.request({ method: "eth_sendTransaction", params: [tx] });
        // res is txHash (string)
        mark(type, address);
        setLastType(type);
        return res;
      }

      // 2) fallback to wagmi walletClient (WalletConnect / other connectors)
      if (walletClient && walletClient.request) {
        // walletClient.request matches EIP-1193
        // Many wallet clients provide .request({ method, params })
        // First try to ensure chain
        try {
          const chainId = await walletClient.request({ method: "eth_chainId", params: [] });
          if (chainId !== "0x2105") {
            try {
              await walletClient.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x2105" }],
              });
            } catch (_) {
              // ignore
            }
          }
        } catch (_) {}

        const res = await walletClient.request({ method: "eth_sendTransaction", params: [tx] });
        mark(type, address);
        setLastType(type);
        return res;
      }

      // 3) no usable provider
      alert("No wallet provider found to send transaction.");
    } catch (err) {
      console.error("sendRawTx error:", err);
      // Wallet will show proper rejection message; we just catch to avoid app crash
      alert("Transaction rejected or failed.");
    }
  }

  return (
    <div className="ritual-wrapper" style={{ marginTop: 10 }}>
      <div className="row" style={{ marginBottom: 12 }}>
        <button
          className={`btn gm ${isCooldown("GM", address) ? "disabled" : ""}`}
          onClick={() => sendRawTx("GM", "GM ⚡")}
          disabled={isCooldown("GM", address)}
        >
          GM Ritual 🌞
        </button>

        <button
          className={`btn gn ${isCooldown("GN", address) ? "disabled" : ""}`}
          onClick={() => sendRawTx("GN", "GN 🌙")}
          disabled={isCooldown("GN", address)}
        >
          GN Ritual 🌙
        </button>

        <button
          className={`btn sleep ${isCooldown("SLEEP", address) ? "disabled" : ""}`}
          onClick={() => sendRawTx("SLEEP", "GoSleep 😴")}
          disabled={isCooldown("SLEEP", address)}
        >
          GoSleep 😴
        </button>
      </div>

      <div style={{ opacity: 0.7, marginBottom: 4 }}>
        Fee: {fee ? ethers.formatEther(fee) : "..."} ETH
      </div>

      <div style={{ marginTop: 10, textAlign: "center" }}>
        <CooldownTimer type={lastType} address={address} />
      </div>
    </div>
  );
}
