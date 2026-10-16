// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ReleaseProof {
    address public admin;
    uint256 public releaseCount;

    struct Release {
        string name;
        string version;
        bytes32 fileHash;
        address publisher;
        uint256 registeredAt;
        bool revoked;
    }

    mapping(address => bool) public publishers;
    mapping(uint256 => Release) public releases;

    event PublisherStatusChanged(address publisher, bool isAuthorized);
    event ReleaseRegistered(uint256 id, string name, string version, bytes32 fileHash, address publisher);
    event ReleaseRevoked(uint256 id);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not administrator");
        _;
    }

    modifier onlyPublisher() {
        require(publishers[msg.sender], "Not an authorized publisher");
        _;
    }

    function setPublisher(address _publisher, bool _authorized) public onlyAdmin {
        publishers[_publisher] = _authorized;
        emit PublisherStatusChanged(_publisher, _authorized);
    }

    function registerRelease(string memory _name, string memory _version, bytes32 _fileHash) public onlyPublisher {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_version).length > 0, "Version cannot be empty");
        require(_fileHash != bytes32(0), "Hash cannot be zero");

        releaseCount++;
        releases[releaseCount] = Release({
            name: _name,
            version: _version,
            fileHash: _fileHash,
            publisher: msg.sender,
            registeredAt: block.timestamp,
            revoked: false
        });

        emit ReleaseRegistered(releaseCount, _name, _version, _fileHash, msg.sender);
    }

    function revokeRelease(uint256 _id) public {
        require(_id > 0 && _id <= releaseCount, "Unknown release");
        require(releases[_id].publisher == msg.sender, "Not the release publisher");
        require(!releases[_id].revoked, "Already revoked");

        releases[_id].revoked = true;
        emit ReleaseRevoked(_id);
    }

    function getRelease(uint256 _id) public view returns (string memory, string memory, bytes32, address, uint256, bool) {
        Release memory r = releases[_id];
        return (r.name, r.version, r.fileHash, r.publisher, r.registeredAt, r.revoked);
    }

    function verifyRelease(uint256 _id, bytes32 _candidateHash) public view returns (string memory) {
        if (_id == 0 || _id > releaseCount) {
            return "UNKNOWN RELEASE";
        }
        Release memory r = releases[_id];
        if (r.revoked) {
            return "REVOKED";
        }
        if (r.fileHash == _candidateHash) {
            return "MATCH \u2014 ACTIVE RELEASE";
        }
        return "MISMATCH";
    }
}