import { Signer } from "@ethersproject/abstract-signer";
import { expect } from "chai";
import hre = require("hardhat");
const { ethers, network } = hre;
import { IERC20Extended, IGelatoUserProxy } from "../typechain";

const CLAIMER = ""; // FILL OUT WITH YOUR ADDRESS
const GELATO_CORE = "0x4e2ca0093028c8401c93aacccaf59288ca6fb728";
const UNI = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

describe("Claim Uni Test", function () {
  // let ops: Ops;
  // let counter: CounterTest;
  let uni: IERC20Extended;
  let proxy: IGelatoUserProxy;

  let signer: Signer;
  let claimer: Signer;
  let proxyAddress: string;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();

    const gelatoCore = await ethers.getContractAt(
      ["function proxyByUser(address) public view returns(address)"],
      GELATO_CORE,
      signer
    );

    uni = await ethers.getContractAt("IERC20Extended", UNI);

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [CLAIMER],
    });

    claimer = await ethers.provider.getSigner(CLAIMER);

    proxyAddress = await gelatoCore.proxyByUser(CLAIMER);
    proxy = await ethers.getContractAt(
      "IGelatoUserProxy",
      proxyAddress,
      claimer
    );
  });

  it("claim UNI", async () => {
    // Measure UNI Balance of user beforehand
    const balanceBefore = await uni.balanceOf(CLAIMER);
    console.log(`Balance before: ${balanceBefore}`);

    const proxyBalance = await uni.balanceOf(proxy.address);

    // Encode transfer of UNI token out of proxy
    await proxy.callAccount(
      uni.address,
      uni.interface.encodeFunctionData("transfer", [CLAIMER, proxyBalance]),
      { gasPrice: ethers.utils.parseUnits("40", 9), gasLimit: 300000 }
    );

    // Measure UNI Balance of user after transfer
    const balanceAfter = await uni.balanceOf(CLAIMER);
    console.log(`Balance after: ${balanceAfter}`);

    expect(balanceAfter).gte(balanceBefore);
  });
});
