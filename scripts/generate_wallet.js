const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  const wallet = ethers.Wallet.createRandom();
  console.log("==================================================");
  console.log("🎉 THROWAWAY DEPLOYER WALLET GENERATED 🎉");
  console.log("==================================================");
  console.log(`Address: ${wallet.address}`);
  console.log(`Private Key: ${wallet.privateKey}`);
  console.log("==================================================");
  
  const envPath = path.join(__dirname, "..", ".env.local");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }
  
  if (envContent.includes("DEPLOYER_PRIVATE_KEY")) {
    console.log("DEPLOYER_PRIVATE_KEY already exists in .env.local");
  } else {
    fs.appendFileSync(envPath, `\nDEPLOYER_PRIVATE_KEY="${wallet.privateKey}"\n`);
    console.log("✅ Saved to .env.local");
  }
  console.log("Please send some Testnet USDC/ARC to this address to deploy the contract.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
