const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  NexusGuard Escrow V2 — Deployment");
  console.log("═══════════════════════════════════════");

  console.log("\n[1/3] Compiling contracts...");
  await hre.run("compile");

  console.log("[2/3] Deploying NexusGuardEscrowV2...");
  
  const NexusGuardEscrowV2 = await hre.ethers.getContractFactory("NexusGuardEscrowV2");
  const escrow = await NexusGuardEscrowV2.deploy();

  await escrow.waitForDeployment();
  const contractAddress = await escrow.getAddress();

  console.log(`\n✅ NexusGuardEscrowV2 deployed to: ${contractAddress}`);

  // Save the contract address: contract-address.txt is what the app reads,
  // and contract-address-v2.txt keeps a V2-specific record alongside V1.
  const addressFilePath = path.join(__dirname, "..", "contract-address.txt");
  fs.writeFileSync(addressFilePath, contractAddress);
  const addressV2Path = path.join(__dirname, "..", "contract-address-v2.txt");
  fs.writeFileSync(addressV2Path, contractAddress);

  console.log("[3/3] Contract address saved to contract-address.txt + contract-address-v2.txt");
  console.log("\n═══════════════════════════════════════");
  console.log("  Deployment Complete!");
  console.log(`  Explorer: https://testnet.arcscan.app/address/${contractAddress}`);
  console.log("═══════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
