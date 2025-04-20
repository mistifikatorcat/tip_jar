import { ethers } from "hardhat";

async function main() {
  // 1. Get the factory
  const TipJar = await ethers.getContractFactory("TipJar");
  console.log("Deploying TipJar…");

  // 2. Deploy (this sends the tx)
  const tipJar = await TipJar.deploy();

  // 3. Wait for it to be mined/deployed
  await tipJar.waitForDeployment();              

  // 4. Fetch the on‑chain address
  const address = await tipJar.getAddress(); 

  console.log("TipJar deployed to:", address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
