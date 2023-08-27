const hre = require("hardhat");

async function main() {
  const Legacy = await hre.ethers.getContractFactory("Legacy");
  const legacy = await Legacy.deploy();

  await legacy.deployed();

  console.log(
    `Legacy deployed to ${legacy.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
