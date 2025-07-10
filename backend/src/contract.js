// src/contract.js
require('dotenv').config();

const {
  JsonRpcProvider,
  Wallet,
  Contract
} = require('ethers');
const fs = require('fs');
const path = require('path');

// 1. Connect to RPC
const rpcUrl = process.env.RPC_URL;
if (!rpcUrl) throw new Error("Missing RPC_URL in .env");
const provider = new JsonRpcProvider(rpcUrl);

// 2. Create signer (your university account)
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Missing PRIVATE_KEY in .env");
const signer = new Wallet(privateKey, provider);

// 3. Load ABI
const abiPath = path.resolve(__dirname, '../', process.env.CONTRACT_ABI_PATH);
if (!fs.existsSync(abiPath)) {
  throw new Error(`ABI file not found at ${abiPath}`);
}
const { abi } = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// 4. Instantiate contract
const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress) throw new Error("Missing CONTRACT_ADDRESS in .env");

const transcriptContract = new Contract(
  contractAddress,
  abi,
  signer
);

module.exports = { transcriptContract };
