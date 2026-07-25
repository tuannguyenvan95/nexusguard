const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Compiling contracts...");
  await hre.run("compile");

  console.log("Deploying NexusGuardEscrow...");
  
  const NexusGuardEscrow = await hre.ethers.getContractFactory("NexusGuardEscrow");
  const escrow = await NexusGuardEscrow.deploy();

  await escrow.waitForDeployment();
  const contractAddress = await escrow.getAddress();

  console.log(`NexusGuardEscrow deployed to: ${contractAddress}`);

  // Save the contract address to a file so we can read it easily
  const addressFilePath = path.join(__dirname, "..", "contract-address.txt");
  fs.writeFileSync(addressFilePath, contractAddress);
  
  console.log("Done! Contract address saved to contract-address.txt");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
