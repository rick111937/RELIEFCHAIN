// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// PS2 Requirement: Self-Sovereign Identity framework mimicking W3C DIDs
contract IdentityRegistry is Ownable {
    
    struct DIDDocument {
        string did; // e.g. "did:reliefchain:xyz"
        string pubKey; 
        bool isRevoked;
        address controller;
    }

    // Mapping Ethereum addresses to their Decentralized Identifiers
    mapping(address => DIDDocument) public registry;
    
    // Mapping trusted Verifiable Credential Issuers (e.g. State bodies, Training institutes)
    mapping(address => bool) public trustedIssuers;

    event DIDRegistered(address indexed controller, string did);
    event DIDRevoked(address indexed controller);
    event IssuerStatusChanged(address indexed issuer, bool status);

    constructor() Ownable(msg.sender) {}

    function registerDID(string memory _did, string memory _pubKey) external {
        require(registry[msg.sender].controller == address(0), "DID already exists for this address");
        
        registry[msg.sender] = DIDDocument({
            did: _did,
            pubKey: _pubKey,
            isRevoked: false,
            controller: msg.sender
        });

        emit DIDRegistered(msg.sender, _did);
    }

    function revokeDID() external {
        require(registry[msg.sender].controller != address(0), "DID does not exist");
        registry[msg.sender].isRevoked = true;
        emit DIDRevoked(msg.sender);
    }

    // Trust modeling for SSI issuers
    function setIssuerStatus(address _issuer, bool _status) external onlyOwner {
        trustedIssuers[_issuer] = _status;
        emit IssuerStatusChanged(_issuer, _status);
    }

    function isVerificationValid(address _subject, address _issuer) external view returns (bool) {
        require(!registry[_subject].isRevoked, "Subject DID is revoked");
        require(trustedIssuers[_issuer], "Issuer is not trusted");
        return true;
    }
}
