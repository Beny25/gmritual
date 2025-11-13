import { useSigner } from "wagmi";
import CooldownTimer from "./CooldownTimer";
import { runRitual } from "../logic/ritual";
import { getUTCDate } from "../logic/ritual";

export default function RitualButtons({ isConnected, address }) {
  const { data: signer } = useSigner();

  const disabled = (type) => {
    if (!address) return true;
    const today = getUTCDate();
    return localStorage.getItem(`cool_${type}_${address}`) === today;
  };

  if (!isConnected) return <p className="connect-msg">Connect wallet to begin</p>;

  return (
    <>
      <div className="center-btn">
        <button
          className={`btn gm ${disabled("GM") ? "disabled" : ""}`}
          disabled={disabled("GM")}
          onClick={() => runRitual(signer, "GM", "GM ⚡", address)}
        >
          GM Ritual 🌞
        </button>
        <CooldownTimer type="GM" address={address} />
      </div>

      <div className="center-btn">
        <button
          className={`btn gn ${disabled("GN") ? "disabled" : ""}`}
          disabled={disabled("GN")}
          onClick={() => runRitual(signer, "GN", "GN 🌙", address)}
        >
          GN Ritual 🌙
        </button>
        <CooldownTimer type="GN" address={address} />
      </div>

      <div className="center-btn">
        <button
          className={`btn sleep ${disabled("SLEEP") ? "disabled" : ""}`}
          disabled={disabled("SLEEP")}
          onClick={() => runRitual(signer, "SLEEP", "GoSleep 😴", address)}
        >
          GoSleep 😴
        </button>
        <CooldownTimer type="SLEEP" address={address} />
      </div>
    </>
  );
}
