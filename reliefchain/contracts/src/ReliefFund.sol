// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ReliefFund is Ownable, ReentrancyGuard {
    struct Campaign {
        string name;
        address ngo;
        uint256 targetAmount;
        uint256 totalRaised;
        uint256 currentMilestone;
        uint256 totalMilestones;
        bool isActive;
        mapping(uint256 => Milestone) milestones;
    }

    struct Milestone {
        string description;
        uint256 amountToRelease;
        string ipfsProofHash; // e.g. geo-tagged images, invoices
        bool isApproved;
        bool isReleased;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donorContributions;
    
    address public daoAddress;

    event CampaignCreated(uint256 id, string name, address ngo, uint256 targetAmount);
    event DonationReceived(uint256 campaignId, address donor, uint256 amount);
    event MilestoneProofSubmitted(uint256 campaignId, uint256 milestoneId, string ipfsProofHash);
    event FundsReleased(uint256 campaignId, uint256 milestoneId, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function setDAOAddress(address _daoAddress) external onlyOwner {
        daoAddress = _daoAddress;
    }

    modifier onlyDAO() {
        require(msg.sender == daoAddress, "Only DAO can approve");
        _;
    }

    function createCampaign(
        string memory _name,
        address _ngo,
        uint256 _targetAmount,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts
    ) external onlyOwner {
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Mismatched milestones");
        
        campaignCount++;
        Campaign storage newC = campaigns[campaignCount];
        newC.name = _name;
        newC.ngo = _ngo;
        newC.targetAmount = _targetAmount;
        newC.totalMilestones = _milestoneDescriptions.length;
        newC.isActive = true;

        uint256 totalChecking = 0;
        for(uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            newC.milestones[i].description = _milestoneDescriptions[i];
            newC.milestones[i].amountToRelease = _milestoneAmounts[i];
            totalChecking += _milestoneAmounts[i];
        }
        require(totalChecking == _targetAmount, "Milestone amounts must equal target");

        emit CampaignCreated(campaignCount, _name, _ngo, _targetAmount);
    }

    function donate(uint256 _campaignId) external payable nonReentrant {
        Campaign storage c = campaigns[_campaignId];
        require(c.isActive, "Campaign inactive");
        require(msg.value > 0, "Donation must be > 0");
        
        c.totalRaised += msg.value;
        donorContributions[_campaignId][msg.sender] += msg.value;
        
        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    function submitProof(uint256 _campaignId, uint256 _milestoneId, string memory _ipfsHash) external {
        Campaign storage c = campaigns[_campaignId];
        require(msg.sender == c.ngo, "Only NGO can submit proof");
        require(!c.milestones[_milestoneId].isApproved, "Already approved");
        require(bytes(_ipfsHash).length > 0, "Hash required");
        
        c.milestones[_milestoneId].ipfsProofHash = _ipfsHash;
        emit MilestoneProofSubmitted(_campaignId, _milestoneId, _ipfsHash);
    }

    // Called by the DAO contract once voting passes
    function approveMilestone(uint256 _campaignId, uint256 _milestoneId) external onlyDAO {
        Campaign storage c = campaigns[_campaignId];
        c.milestones[_milestoneId].isApproved = true;
    }

    function releaseFunds(uint256 _campaignId, uint256 _milestoneId) external nonReentrant {
        Campaign storage c = campaigns[_campaignId];
        require(c.milestones[_milestoneId].isApproved, "Milestone not approved by DAO");
        require(!c.milestones[_milestoneId].isReleased, "Already released");
        require(c.totalRaised >= c.milestones[_milestoneId].amountToRelease, "Insufficient funds raised");
        
        c.milestones[_milestoneId].isReleased = true;
        c.currentMilestone++;

        uint256 amount = c.milestones[_milestoneId].amountToRelease;
        (bool success, ) = payable(c.ngo).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(_campaignId, _milestoneId, amount);
    }
}
