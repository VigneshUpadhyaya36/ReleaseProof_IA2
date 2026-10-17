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
* **Deployed Contract Address:** `0xfe63631393F8611191AE06cD341F5D940fB34897`

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
<img width="1917" height="861" alt="Screenshot 2026-10-14 221826" src="https://github.com/user-attachments/assets/95ebccd6-8f4c-4256-8820-4ba5c48b17cc" />


### 2. Smart Contract Deployment
<img width="1917" height="872" alt="Screenshot 2026-10-14 221908" src="https://github.com/user-attachments/assets/1068cea3-ba1b-49c0-b3b1-79e6d0fffbec" />


### 3. MetaMask Wallet Connection & UI Integration
<img width="1915" height="962" alt="Screenshot 2026-10-14 222209" src="https://github.com/user-attachments/assets/77467a79-e319-42df-b6f8-eb28494ede5f" />
<img width="1917" height="958" alt="Screenshot 2026-10-14 222221" src="https://github.com/user-attachments/assets/72817d0a-3a48-4574-88db-fb4fa7165eff" />
<img width="1906" height="957" alt="Screenshot 2026-10-14 222411" src="https://github.com/user-attachments/assets/242a3799-a084-43ca-b04b-e4e475ff7de1" />
<img width="1903" height="950" alt="Screenshot 2026-10-14 222421" src="https://github.com/user-attachments/assets/96b64449-2a4b-48cb-b0ba-5f7a9a5eb2ce" />



### 4. Successful Transaction (File Registration)
<img width="1910" height="957" alt="Screenshot 2026-10-14 223512" src="https://github.com/user-attachments/assets/173ea65f-9398-488f-98c9-a8677c88a270" />

<img width="1901" height="945" alt="Screenshot 2026-10-14 223525" src="https://github.com/user-attachments/assets/96a17731-f75e-49fb-a88f-e228474fb229" />


### 5. Blockchain Data Retrieval (Integrity Verification)
<img width="1902" height="947" alt="Screenshot 2026-10-14 223840" src="https://github.com/user-attachments/assets/a1ef61ee-2ede-4ac6-817b-03de1b7cd9f0" />
<img width="1008" height="483" alt="Screenshot 2026-10-14 224048" src="https://github.com/user-attachments/assets/4d7f387a-6db8-492c-b9c9-9c6c28053443" />
<img width="1906" height="943" alt="Screenshot 2026-10-14 224816" src="https://github.com/user-attachments/assets/9bb6a259-5568-4b1f-acb4-7f1e17b19c13" />



### 6. Failed Transaction (Unauthorized Attempt)
<img width="1075" height="638" alt="Screenshot 2026-10-14 225140" src="https://github.com/user-attachments/assets/ff597ce1-16b4-4568-9fad-abc2a8f448b8" />
<img width="1901" height="950" alt="Screenshot 2026-10-14 224411" src="https://github.com/user-attachments/assets/03c7d111-98d1-49cb-8fa2-6eecb0f7377c" />


