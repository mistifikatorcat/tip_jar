import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",      // must match your .env key
      accounts:
        process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length > 0
          ? [process.env.PRIVATE_KEY]
          : [],
    },
  },
};

export default config;
