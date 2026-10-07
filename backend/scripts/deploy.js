const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ShipmentTracking = await hre.ethers.getContractFactory("ShipmentTracking");
  const contract = await ShipmentTracking.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("ShipmentTracking deployed to:", address);

  // Save contract address and ABI to src/config for backend use
  const artifact = hre.artifacts.readArtifactSync("ShipmentTracking");

  const deploymentData = {
    address,
    abi: artifact.abi,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "../src/config/contract.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  console.log("Contract info saved to src/config/contract.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
