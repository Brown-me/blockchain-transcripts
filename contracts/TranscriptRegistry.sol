// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TranscriptRegistry {
    address public owner;

    struct Transcript {
        string matricNumber;
        string documentHash;
        address uploader;   // should always be owner
        uint256 timestamp;
    }

    // Lookup tables
    mapping(string => Transcript) private byMatric;
    mapping(string => Transcript) private byHash;

    // To check existence
    mapping(string => bool) private matricExists;
    mapping(string => bool) private hashExists;

    // Events
    // Removed indexed on strings to allow proper decoding in tests
    event TranscriptUploaded(
        string matricNumber,
        string documentHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function uploadTranscript(string calldata matricNumber, string calldata documentHash) external onlyOwner {
        require(!matricExists[matricNumber], "Matric number already registered");
        require(!hashExists[documentHash], "Document hash already registered");

        Transcript memory t = Transcript({
            matricNumber: matricNumber,
            documentHash: documentHash,
            uploader: msg.sender,
            timestamp: block.timestamp
        });

        byMatric[matricNumber] = t;
        byHash[documentHash] = t;
        matricExists[matricNumber] = true;
        hashExists[documentHash] = true;

        emit TranscriptUploaded(matricNumber, documentHash, block.timestamp);
    }

    function getByMatric(string calldata matricNumber) external view returns (Transcript memory) {
        require(matricExists[matricNumber], "No such matric number");
        return byMatric[matricNumber];
    }

    function getByHash(string calldata documentHash) external view returns (Transcript memory) {
        require(hashExists[documentHash], "No such document hash");
        return byHash[documentHash];
    }
}
