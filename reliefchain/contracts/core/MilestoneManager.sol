// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MilestoneManager
/// @notice Manages milestones per project: creation, proof submission, and fund release.
contract MilestoneManager {
    enum MilestoneStatus { PENDING, PROOF_SUBMITTED, APPROVED, REJECTED, FUNDS_RELEASED }

    struct Milestone {
        uint256 id;
        uint256 projectId;
        string name;
        uint256 fundAllocation;  // in wei
        string proofCID;         // IPFS CID of proof documents
        MilestoneStatus status;
    }

    uint256 public milestoneCount;
    mapping(uint256 => Milestone) public milestones;
    // projectId => milestone ids
    mapping(uint256 => uint256[]) public projectMilestones;

    event MilestoneAdded(uint256 indexed projectId, uint256 milestoneId, string name);
    event ProofSubmitted(uint256 indexed milestoneId, string ipfsCID);
    event MilestoneApproved(uint256 indexed milestoneId);
    event FundsReleased(uint256 indexed milestoneId);

    function addMilestone(uint256 projectId, string calldata name, uint256 fundAllocation) external returns (uint256) {
        milestoneCount++;
        milestones[milestoneCount] = Milestone({
            id: milestoneCount,
            projectId: projectId,
            name: name,
            fundAllocation: fundAllocation,
            proofCID: "",
            status: MilestoneStatus.PENDING
        });
        projectMilestones[projectId].push(milestoneCount);
        emit MilestoneAdded(projectId, milestoneCount, name);
        return milestoneCount;
    }

    function submitProof(uint256 milestoneId, string calldata ipfsCID) external {
        require(milestones[milestoneId].status == MilestoneStatus.PENDING, "Invalid state");
        milestones[milestoneId].proofCID = ipfsCID;
        milestones[milestoneId].status = MilestoneStatus.PROOF_SUBMITTED;
        emit ProofSubmitted(milestoneId, ipfsCID);
    }

    function getMilestonesForProject(uint256 projectId) external view returns (uint256[] memory) {
        return projectMilestones[projectId];
    }
}
