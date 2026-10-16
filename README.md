# ReleaseProof: Decentralized Software Integrity Verification

## Overview and Problem Statement
In the modern digital landscape, software patches, configuration files, and critical data payloads are continuously distributed across vast networks. A significant vulnerability arises after these files are officially approved: malicious actors or internal system errors can silently intercept and modify these artifacts post-release. Furthermore, when a publisher explicitly deprecates or revokes a compromised release, users who have already downloaded the file possess no automated, trustless mechanism to verify its active status. This allows dangerous or obsolete files to continue circulating, posing severe security risks.

## Blockchain Implementation Architecture
ReleaseProof resolves this vulnerability by utilizing the immutable and transparent properties of the Ethereum blockchain. The architecture operates on a strict permissioned model governed by a Solidity smart contract. 

When a publisher wishes to release a file, the frontend application computes a cryptographic SHA-256 hash of the artifact locally. This ensures that massive file data never burdens the network and proprietary data never leaves the user's local machine. Only the hash and release metadata are signed via MetaMask and registered on-chain. Subsequently, any verifier can download the file, calculate its local hash, and query the blockchain using `Ethers.js`. The smart contract instantly evaluates the hash against the immutable ledger and checks a decentralized `revoked` flag. This cryptographic guarantee ensures the file is authentic, unaltered, and actively supported by the original publisher.

## Technical Stack & Configuration
* **Smart Contract Layer:** Solidity (^0.8.20)
* **Frontend Application:** HTML5, CSS3
* **Web3 Integration:** JavaScript leveraging `Ethers.js` (v5.7.2)
* **Testing & Deployment Environment:** Ganache (Local RPC), MetaMask, Remix IDE

## Environment Deployment Details
* **Network Name:** Ganache Local Testnet
* **RPC Endpoint URL:** `http://127.0.0.1:7545`
* **Chain ID:** 1337
* **Deployed Contract Address:** `[PASTE_YOUR_CONTRACT_ADDRESS_HERE]`

## Execution and MetaMask Connection Workflow
1. **Network Setup:** Initialize a local Ganache instance operating on Network ID 1337. Import three distinct test wallets into the MetaMask extension to represent the system Administrator, an authorized Publisher, and an end-user Verifier.
2. **Contract Compilation and Deployment:** Open `ReleaseProof.sol` inside Remix IDE. Compile the contract using the `paris` EVM version to ensure compatibility with Ganache's Merge hardfork. Deploy the contract using the Administrator's wallet via the External HTTP Provider setting.
3. **Application Initialization:** Serve `index.html` via a local web server (e.g., Live Server).
4. **Wallet Integration:** Click the "Connect / Refresh MetaMask" button on the UI. The application utilizes `window.ethereum.request` via Ethers.js to securely prompt the user for account access.
5. **System Interaction:** Utilize the dashboard to Authorize Publishers (Admin privilege), Register Hashes (Publisher privilege), and Verify Files (Global privilege).

## Quality Assurance & Testing Matrix

| Test Scenario | Action Performed | Provided Input | Expected Output | Observed Result |
| :--- | :--- | :--- | :--- | :--- |
| **Valid Registration** | Authorized publisher registers file | `security-config.json` | Hash stored on-chain | SUCCESS |
| **File Integrity Match** | Verify exact file against active ID | `security-config.json` | `MATCH — ACTIVE RELEASE` | MATCH |
| **Tampered File Check** | Verify modified file against ID | `security-config-modified.json` | `MISMATCH` | MISMATCH |
| **Non-Existent Record** | Verify against unregistered ID | Release ID `999` | `UNKNOWN RELEASE` | UNKNOWN RELEASE |
| **Unauthorized Action** | Non-publisher attempts to register | Any file | Transaction Reverted | REVERTED |
| **Release Revocation** | Publisher revokes an active release | Release ID `1` | Status updated on-chain | SUCCESS |
| **Revoked File Check** | Verify original file against revoked ID| `security-config.json` | `REVOKED` | REVOKED |

## Troubleshooting & Error Handling
During the development and testing phases, specific network and logic errors were encountered and successfully handled:
* **Unauthorized Access:** If a standard user wallet attempts to call publisher-only functions, the Solidity `require()` modifiers trigger a transaction revert. (See failed transaction screenshot).
* **EVM Hardfork Incompatibility:** Initial gas estimation failures occurred due to the `PUSH0` opcode introduced in Solidity 0.8.20 conflicting with Ganache. This was resolved by configuring the Remix compiler to target the `paris` EVM version.
* **Internal JSON-RPC Error:** This occurs when attempting to sign a transaction with a wallet that lacks the correct permissions or sufficient gas, properly preventing unauthorized state changes.

---

## Technical Evidence & Project Screenshots

### 1. Smart Contract Compilation
[Insert Screenshot Here: Remix IDE showing successful compilation with Solidity 0.8.20 and the green checkmark]

### 2. Smart Contract Deployment
[Insert Screenshot Here: Remix IDE terminal logs showing successful deployment and the deployed contract address]

### 3. MetaMask Wallet Connection & UI Integration
[Insert Screenshot Here: The web dashboard displaying the connected wallet address via Ethers.js]

### 4. Successful Transaction (File Registration)
[Insert Screenshot Here: The web dashboard displaying the successful SHA-256 hash generation and registration receipt]

### 5. Blockchain Data Retrieval (Integrity Verification)
[Insert Screenshot Here: The web dashboard displaying a MATCH/MISMATCH result alongside the fetched on-chain metadata]

### 6. Failed Transaction (Unauthorized Attempt)
[Insert Screenshot Here: MetaMask or browser alert showing the reverted transaction due to lack of publisher authorization]