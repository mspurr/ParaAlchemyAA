# Para Smart Account Example

A simple demonstration of sending transactions server-side using Account Abstraction (ERC-4337) with Para Server SDK and Alchemy Account Kit on Monad testnet.

## What This Does

This example shows how to:
- Send transactions server-side using Para's MPC wallet as the signer
- Create a smart contract wallet using Account Abstraction (ERC-4337)
- Use Alchemy Account Kit for gasless transactions on Monad testnet
- Send ERC-20 token transfers through the smart account
- Implement signature adjustment required for Para's 2/2 MPC signatures

> **Important:** This is a server-side implementation. To use this, you need to export your Para session from a client-side application (browser/mobile) and send it to your server. In this example we just load a valid token from the `PARA_SESSION_TOKEN` environment variable.

## Prerequisites

- A Para API key and session token
- An Alchemy API key with Account Kit enabled
- An Alchemy gas policy ID (for gas sponsorship)

## Setup

> **⚠️ Warning:** This script currently crashes when run with Bun. Please use Node.js/npm instead.

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

   **How to get a session token:**
   
   From your client-side application (after user connects wallet), export the session:
   ```javascript
   // Client-side
   const serializedSession = await para.exportSession();
   // Send this to your server and set it as PARA_SESSION_TOKEN
   ```
   
   See [Para Server Setup Guide](https://docs.getpara.com/v2/server/setup) for more details.

3. **Run the example:**
```bash
npm start
```

The Para wallet acts as the EOA (Externally Owned Account) signer that controls the smart contract wallet, while Alchemy manages the smart contract wallet on-chain.

## References

- [Para Server Setup Guide](https://docs.getpara.com/v2/server/setup)
- [Para Server SDK Account Abstraction Guide](https://docs.getpara.com/v2/server/guides/account-abstraction)
- [Para Examples - Alchemy EIP-7702 with Bun](https://github.com/getpara/examples-hub/blob/2.0.0-alpha/server/with-bun/src/routes/signWithAlchemyEIP7702.ts)
- [Test Gasless TX Example](https://github.com/Vinhhjk/test-gasless-tx)

## Configuration

The example is configured for **Monad Testnet**. To use a different chain, modify the chain and RPC URL in `index.ts`.
