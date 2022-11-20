import { ethers } from "hardhat";

const GELATO_CORE = "0x4e2ca0093028c8401c93aacccaf59288ca6fb728";
const UNI = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

// ######## PLEASE FILL IN ########
// Address to receive the UNI tokens
const DESTINATION = "";
// Gas price for transaction
const GAS_PRICE = ethers.utils.parseUnits("15", 9);

const claimUni = async () => {
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  console.log("Signer: ", signerAddress);

  const gelatoCore = await ethers.getContractAt(
    ["function proxyByUser(address) public view returns(address)"],
    GELATO_CORE,
    signer
  );

  const uni = await ethers.getContractAt("IERC20Extended", UNI);

  const proxyAddress = await gelatoCore.proxyByUser(signerAddress);
  const proxy = await ethers.getContractAt(
    "IGelatoUserProxy",
    proxyAddress,
    signer
  );

  // Measure UNI Balance of user beforehand
  const balanceBefore = await uni.balanceOf(DESTINATION);
  console.log(`Balance before: ${balanceBefore}`);

  const proxyBalance = await uni.balanceOf(proxy.address);

  // Encode transfer of UNI token out of proxy
  const tx = await proxy.callAccount(
    uni.address,
    uni.interface.encodeFunctionData("transfer", [DESTINATION, proxyBalance]),
    { gasPrice: GAS_PRICE, gasLimit: 300000 }
  );

  await tx.wait();
  console.log(`Tx mined`);

  // Measure UNI Balance of user after transfer
  const balanceAfter = await uni.balanceOf(DESTINATION);
  console.log(`Balance after: ${balanceAfter}`);
};

claimUni()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
