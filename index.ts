import { config } from 'dotenv';
config();

import {
  http,
  encodeFunctionData,
  type LocalAccount,
} from 'viem';
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import type { WithImplicitCoercion } from 'buffer';
import { hashMessage, type SignableMessage, type WalletClient } from "viem";
import { WalletClientSigner } from "@alchemy/aa-core";
import { alchemy, monadTestnet } from '@account-kit/infra';
import { createModularAccountV2Client, type ModularAccountV2Client } from '@account-kit/smart-contracts';

function hexStringToBase64(hexString: WithImplicitCoercion<string>) {
  return Buffer.from(hexString, "hex").toString("base64");
}

// Custom sign message function with signature byte adjustment
async function customSignMessage(para: ParaServer, message: SignableMessage): Promise<`0x${string}`> {
  // Get the first wallet from Para client
  const wallet = para.wallets ? Object.values(para.wallets)[0] : null;
  if (!wallet || typeof wallet.id !== 'string') {
    throw new Error("Para wallet not available for signing.");
  }

  // Hash and convert the message
  const hashedMessage = hashMessage(message);
  const messagePayload = hashedMessage.startsWith("0x") ? hashedMessage.substring(2) : hashedMessage;
  const messageBase64 = hexStringToBase64(messagePayload);

  // Sign with Para
  const res = await para.signMessage({
    walletId: wallet.id,
    messageBase64: messageBase64,
  });

  if (!("signature" in res)) {
    throw new Error("Signature failed");
  }

  // Adjust the signature's 'v' value for on-chain verification
  let signature = res.signature;
  const vHex = signature.slice(-2);
  const v = parseInt(vHex, 16);

  if (!isNaN(v) && v < 27) {
    const adjustedVHex = (v + 27).toString(16).padStart(2, "0");
    signature = signature.slice(0, -2) + adjustedVHex;
  }

  return `0x${signature}` as `0x${string}`;
}

async function transferTokenWithSmartAccount(
  targetAddress: `0x${string}`,
  tokenAddress: `0x${string}`,
  amount: bigint,
  smartAccountClient: ModularAccountV2Client
): Promise<`0x${string}`> {
  const erc20Abi = [
    {
      "inputs": [
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "transfer",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;
  const transferTxData = [
    {
      target: tokenAddress,
      data: encodeFunctionData({ abi: erc20Abi, functionName: 'transfer', args: [targetAddress, amount] }),
    }
  ];

  const res = await smartAccountClient.sendUserOperation({
    uo: transferTxData,
  });
  console.log("res", res);

  const receipt = await smartAccountClient.waitForUserOperationTransaction(res);
  return receipt;
}

async function main() {
  if (!process.env.PARA_API_KEY) {
    throw new Error('PARA_API_KEY is required');
  }
  if (!process.env.PARA_SESSION_TOKEN) {
    throw new Error('PARA_BASE_URL is required');
  }

  const session = process.env.PARA_SESSION_TOKEN;
  const para = new ParaServer(Environment.BETA, process.env.PARA_API_KEY);
  await para.importSession(session);

  if (!(await para.isSessionActive())) throw new Error('Para session not active');
  if (!process.env.ALCHEMY_API_KEY) {
    throw new Error('ALCHEMY_API_KEY is required');
  }
  if (!process.env.ALCHEMY_GAS_POLICY_ID) {
    throw new Error('ALCHEMY_GAS_POLICY_ID is required');
  }

  // Create a Para account for Viem
  const viemParaAccount: LocalAccount = createParaAccount(para);

  // Override signMessage to use custom implementation
  viemParaAccount.signMessage = async ({ message }: { message: SignableMessage }) => customSignMessage(para, message);

  // Use Alchemy-supported chain
  const chain = monadTestnet;
  const rpcUrl = `https://monad-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

  // Create the Viem client
  const viemClient: WalletClient = createParaViemClient(para, {
    account: viemParaAccount,
    chain: chain,
    transport: http(rpcUrl),
  });

  // Create WalletClientSigner for Alchemy  
  const walletClientSigner = new WalletClientSigner(viemClient as any, "para");

  // Create Alchemy smart account client
  const alchemyClient = await createModularAccountV2Client({
    transport: alchemy({
      rpcUrl: rpcUrl,
    }),
    chain: chain,
    signer: walletClientSigner as any,
    policyId: process.env.ALCHEMY_GAS_POLICY_ID,
  });

  const smartWalletAddress = alchemyClient.getAddress();
  console.log("smart account address", smartWalletAddress)

  const recipientAddress = "0x7EE314Ba3dc6e4a34eeBF17c5034DecDa4Fb5D1e";
  const tokenAddress = "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea";
  const amount = 1000000n;

  const transferTokenReceipt = await transferTokenWithSmartAccount(
    recipientAddress,
    tokenAddress,
    amount,
    alchemyClient
  );

  console.log('Transfer Token Receipt: ', transferTokenReceipt);
  console.log(`https://testnet.monadexplorer.com/tx/${transferTokenReceipt}`)
}
main();
