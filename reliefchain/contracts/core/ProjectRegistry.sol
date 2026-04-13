// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ProjectRegistry
/// @notice NGOs register and manage disaster relief projects here.
contract ProjectRegistry is Ownable {
    enum ProjectStatus { ACTIVE, PAUSED, COMPLETED, CANCELLED }

    struct Project {
        uint256 id;
        address ngo;
        string name;
        string description;
        string location;
        uint256 targetAmount;
        ProjectStatus status;
        uint256 createdAt;
    }

    uint256 public projectCount;
    mapping(uint256 => Project) public projects;
    mapping(address => bool) public verifiedNGOs;

    event ProjectCreated(uint256 indexed id, address indexed ngo, string name);
    event NGOVerified(address indexed ngo);

    constructor() Ownable(msg.sender) {}

    modifier onlyVerifiedNGO() {
        require(verifiedNGOs[msg.sender], "Not a verified NGO");
        _;
    }

    function verifyNGO(address ngo) external onlyOwner {
        verifiedNGOs[ngo] = true;
        emit NGOVerified(ngo);
    }

    function createProject(
        string calldata name,
        string calldata description,
        string calldata location,
        uint256 targetAmount
    ) external onlyVerifiedNGO returns (uint256) {
        projectCount++;
        projects[projectCount] = Project({
            id: projectCount,
            ngo: msg.sender,
            name: name,
            description: description,
            location: location,
            targetAmount: targetAmount,
            status: ProjectStatus.ACTIVE,
            createdAt: block.timestamp
        });
        emit ProjectCreated(projectCount, msg.sender, name);
        return projectCount;
    }

    function getProject(uint256 id) external view returns (Project memory) {
        return projects[id];
    }
}
