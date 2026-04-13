// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ReliefFund.sol"; // Used to enforce interface connection if needed

contract ReliefDAO is Ownable {
    ReliefFund public reliefFund;

    struct Proposal {
        uint256 campaignId;
        uint256 milestoneId;
        string ipfsProofHash; // Reference to the credential/invoice
        uint256 forVotes;
        uint256 againstVotes;
        uint256 deadline;
        bool executed;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 proposalId, uint256 campaignId, uint256 milestoneId, string ipfsHash);
    event Voted(uint256 proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 proposalId, bool passed);

    constructor(address _reliefFund) Ownable(msg.sender) {
        reliefFund = ReliefFund(_reliefFund);
    }

    // In a real DAO, voting power is based on ERC20 balance. 
    // For this prototype, we simulate 1 vote per address.
    function getVotingPower(address _voter) public pure returns (uint256) {
        return 1; 
    }

    function createProposal(uint256 _campaignId, uint256 _milestoneId, string memory _ipfsProofHash) external {
        // Typically only the NGO or specific members could create this to request verification
        proposalCount++;
        Proposal storage newP = proposals[proposalCount];
        newP.campaignId = _campaignId;
        newP.milestoneId = _milestoneId;
        newP.ipfsProofHash = _ipfsProofHash;
        newP.deadline = block.timestamp + 3 days; // 3 day voting window
        newP.executed = false;

        emit ProposalCreated(proposalCount, _campaignId, _milestoneId, _ipfsProofHash);
    }

    function vote(uint256 _proposalId, bool _support) external {
        Proposal storage p = proposals[_proposalId];
        require(block.timestamp < p.deadline, "Voting period ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        uint256 weight = getVotingPower(msg.sender);
        require(weight > 0, "No voting power");

        if (_support) {
            p.forVotes += weight;
        } else {
            p.againstVotes += weight;
        }

        hasVoted[_proposalId][msg.sender] = true;
        emit Voted(_proposalId, msg.sender, _support, weight);
    }

    function executeProposal(uint256 _proposalId) external {
        Proposal storage p = proposals[_proposalId];
        require(block.timestamp >= p.deadline, "Voting still active");
        require(!p.executed, "Already executed");

        p.executed = true;

        if (p.forVotes > p.againstVotes) {
            // Milestone verified by community DAO. Trigger the ReliefFund contract
            reliefFund.approveMilestone(p.campaignId, p.milestoneId);
            emit ProposalExecuted(_proposalId, true);
        } else {
            emit ProposalExecuted(_proposalId, false);
        }
    }
}
