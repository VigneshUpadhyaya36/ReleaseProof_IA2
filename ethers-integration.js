const contractABI = [
    "function setPublisher(address _publisher, bool _authorized) public",
    "function registerRelease(string memory _name, string memory _version, bytes32 _fileHash) public",
    "function revokeRelease(uint256 _id) public",
    "function getRelease(uint256 _id) public view returns (string, string, bytes32, address, uint256, bool)",
    "function verifyRelease(uint256 _id, bytes32 _candidateHash) public view returns (string)"
];

let provider, signer;

async function initWallet() {
    if (!window.ethereum) return alert("MetaMask extension not detected!");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const address = await signer.getAddress();
    document.getElementById('walletStatus').innerText = `Active Wallet: ${address}`;
}

if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
            await initWallet();
        } else {
            signer = null;
            document.getElementById('walletStatus').innerText = "Status: Disconnected";
        }
    });
}

document.getElementById('connectWalletBtn').onclick = initWallet;

async function getFileHash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return '0x' + Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getContract() {
    const address = document.getElementById('contractAddress').value.trim();
    if (!address) throw new Error("Contract address field is empty.");
    if (!signer) throw new Error("Wallet not connected. Click Connect MetaMask first.");
    return new ethers.Contract(address, contractABI, signer);
}

document.getElementById('authBtn').onclick = async () => {
    try {
        const tx = await getContract().setPublisher(document.getElementById('pubAddress').value.trim(), true);
        await tx.wait(); 
        alert("Publisher authorized successfully!");
    } catch (err) { alert("Authorization Failed: " + (err.reason || err.message)); }
};

document.getElementById('registerBtn').onclick = async () => {
    try {
        const file = document.getElementById('fileToRegister').files[0];
        if (!file) return alert("Select a file first.");
        const hash = await getFileHash(file);
        const tx = await getContract().registerRelease(
            document.getElementById('relName').value.trim(),
            document.getElementById('relVersion').value.trim(), 
            hash
        );
        await tx.wait();
        document.getElementById('registerResult').innerText = `Success! Registered Hash:\n${hash}`;
    } catch (err) { alert("Registration Failed: " + (err.reason || err.message)); }
};

document.getElementById('verifyBtn').onclick = async () => {
    try {
        const id = document.getElementById('verifyId').value.trim();
        const file = document.getElementById('fileToVerify').files[0];
        if (!file) return alert("Select a file to verify.");
        const hash = await getFileHash(file);
        const c = getContract();
        const status = await c.verifyRelease(id, hash);
        document.getElementById('verifyResult').innerText = `Result: ${status}`;
        if (status !== "UNKNOWN RELEASE") {
            const data = await c.getRelease(id);
            document.getElementById('blockchainData').innerText = 
                `On-Chain Record -> Name: ${data[0]} | Version: ${data[1]} | Hash: ${data[2]} | Publisher: ${data[3]} | Revoked: ${data[5]}`;
        } else {
            document.getElementById('blockchainData').innerText = "No blockchain record exists for this Release ID.";
        }
    } catch (err) { alert("Verification Error: " + err.message); }
};

document.getElementById('revokeBtn').onclick = async () => {
    try {
        const id = document.getElementById('revokeId').value.trim();
        if (!id) return alert("Enter Release ID to revoke.");
        const tx = await getContract().revokeRelease(id);
        await tx.wait(); 
        const resDiv = document.getElementById('revokeResult');
        resDiv.style.display = 'block';
        resDiv.innerText = `Release ID ${id} has been successfully REVOKED on-chain!`;
        alert(`Release ID ${id} Revoked!`);
    } catch (err) { alert("Revocation Failed: " + (err.reason || err.message)); }
};