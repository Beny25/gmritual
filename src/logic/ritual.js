import { ethers } from "ethers";

export const CONTRACT = "0x725Ccb4ddCB715f468b301395Dfd1b1efDb5308A";

export const ABI = [
  "function performRitual(string calldata newMessage) external payable",
  "function fee() view returns (uint256)"
];

export function getUTCDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function runRitual(signer, type, message, account) {
  const key = `cool_${type}_${account}`;
  const today = getUTCDate();

  if (localStorage.getItem(key) === today) {
    return alert(`You already did ${type} today`);
  }

  try {
    const c = new ethers.Contract(CONTRACT, ABI, signer);
    const fee = await c.fee();

    const tx = await c.performRitual(message, { value: fee });
    alert("TX sent… waiting confirmation");
    await tx.wait();

    localStorage.setItem(key, today);

    alert(`${type} ritual complete!`);
  } catch (err) {
    console.error(err);
    alert("Ritual failed ❌");
  }
}
