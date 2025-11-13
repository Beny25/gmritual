export default function AddressBar({ address }) {
  const short = (a) => a.slice(0, 6) + "…" + a.slice(-4);

  return (
    <div className="addrBar">
      <span className="chip">
        <span className="dot"></span>
        {short(address)}
      </span>
    </div>
  );
}
