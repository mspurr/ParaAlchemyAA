# Para Smart Account Example

A simple demonstration of sending transactions using Account Abstraction (ERC-4337) with Para Server SDK and Alchemy Account Kit on Monad testnet.

## What This Does

This example shows how to:
- Create a smart contract wallet using Para's MPC wallet as the signer
- Use Alchemy Account Kit for Account Abstraction on Monad testnet
- Send ERC-20 token transfers through the smart account
- Implement signature adjustment required for Para's 2/2 MPC signatures

## Prerequisites

- A Para API key and session token
- An Alchemy API key with Account Kit enabled
- An Alchemy gas policy ID (for gas sponsorship)

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the root directory with the following variables:
```env
PARA_API_KEY=your_para_api_key
PARA_SESSION_TOKEN=your_session_token
ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_GAS_POLICY_ID=your_gas_policy_id
```

3. **Run the example:**
```bash
npm start
```

The Para wallet acts as the EOA (Externally Owned Account) signer that controls the smart contract wallet, while Alchemy manages the smart contract wallet on-chain.

## References

- [Para Server SDK Account Abstraction Guide](https://docs.getpara.com/v2/server/guides/account-abstraction)
- [Para Examples - Alchemy EIP-7702 with Bun](https://github.com/getpara/examples-hub/blob/2.0.0-alpha/server/with-bun/src/routes/signWithAlchemyEIP7702.ts)

## Configuration

The example is configured for **Monad Testnet**. To use a different chain, modify the chain and RPC URL in `index.ts`.
