import { ethers } from "ethers";
import { config } from "../config";
import { NETWORK } from "./index";
import { abi } from "./BoomFactory.json";

const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL, 97);
console.log(provider);
const connectedWallet = new ethers.Wallet(config.PRIVATE_KEY, provider).connect(
  provider
);

const factory = new ethers.Contract(
  NETWORK.BSC.factory.address,
  abi,
  connectedWallet
);

// console.log(factory.marketplace());
// const mint = async () => {
//   const boomNftContract = await factory.boomER721Token();
//   console.log(boomNftContract);

//   //   try {
//   //     const minted = boomNftContract.mintTo(
//   //       connectedWallet.address,
//   //       "https://omambia.com/image.png"
//   //     );

//   //     console.log(minted);
//   //   } catch (error) {
//   //     console.log("Error", error);
//   //   }
// };

const start = async () => {
  //   await mint();
  try {
    await factory.owner();
  } catch (error) {
    console.log("LOG", error);
  }
};

start();
