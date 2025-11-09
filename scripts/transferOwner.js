const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const CONTRACT_ADDRESS = "0x499b504563C08A661a0c6e1387eb4FB551C362F5"; // GMbandit
  const NEW_OWNER = "0x4AE70118DD2cB814404DaAA064daB470B7F76542"; // wallet utama lo

  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY_DEPLOYER, hre.ethers.provider);

  console.log("🚀 Starting ownership transfer ritual...");
  console.log(`📜 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`👑 New owner: ${NEW_OWNER}`);

  const GMbandit = await hre.ethers.getContractFactory("GMbandit");
  const contract = GMbandit.attach(CONTRACT_ADDRESS);

  try {
    const tx = await contract.connect(wallet).transferOwnership(NEW_OWNER);
    console.log(`⛽ TX sent: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Ownership successfully transferred to ${NEW_OWNER}`);
  } catch (err) {
    console.error("❌ Error transferring ownership:", err.message);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exitCode = 1;
});
