require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const owner = process.env.OWNER_ADDRESS;
  const collector = process.env.COLLECTOR_ADDRESS;

  console.log("🚀 Deploying GMbanditV2 to Base...");
  const GMbanditV2 = await hre.ethers.getContractFactory("GMbanditV2");
  const contract = await GMbanditV2.deploy(owner, collector);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`✅ GMbanditV2 deployed to: ${address}`);

  // Optional verify on BaseScan
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: [owner, collector],
    });
    console.log("🔍 Verified successfully on BaseScan!");
  } catch (err) {
    console.log("⚠️ Verification skipped or failed:", err.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
