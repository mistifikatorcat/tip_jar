// utils/TipJar.ts
import TipJarJson from "../../artifacts/contracts/TipJar.sol/TipJar.json";

export const TIPJAR_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
export const TIPJAR_ABI = TipJarJson.abi;
