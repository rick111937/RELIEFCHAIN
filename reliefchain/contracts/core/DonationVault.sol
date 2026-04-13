// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title DonationVault
/// @notice Escrows funds, protected against reentrancy.
contract DonationVault is Ownable, ReentrancyGuard {
    mapping(uint256 => uint256) public projectBalances;
    address public oracle;

    event DonationReceived(address indexed donor, uint256 indexed projectId, uint256 amount);
    event FundsReleased(uint256 indexed projectId, address indexed ngo, uint256 amount);
    event AnticipatoryFundsReleased(uint256 indexed projectId, address indexed ngo, uint256 amount, uint256 severityScore);

    constructor() Ownable(msg.sender) {}

    modifier onlyOracle() {
        require(msg.sender == oracle, "Not authorized Oracle");
        _;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }

    function donate(uint256 projectId) external payable nonReentrant {
        require(msg.value > 0, "Zero donation");
        projectBalances[projectId] += msg.value;
        emit DonationReceived(msg.sender, projectId, msg.value);
    }

    function releaseFunds(uint256 projectId, address payable ngo, uint256 amount) external onlyOwner nonReentrant {
        require(projectBalances[projectId] >= amount, "Insufficient balance");
        projectBalances[projectId] -= amount;
        (bool sent, ) = ngo.call{value: amount}("");
        require(sent, "Transfer failed");
        emit FundsReleased(projectId, ngo, amount);
    }

    function oracleReleaseFunds(uint256 projectId, address payable ngo, uint256 amount, uint256 severityScore) external onlyOracle nonReentrant {
        require(projectBalances[projectId] >= amount, "Insufficient balance");
        require(severityScore >= 60, "Severity below threshold");
        
        projectBalances[projectId] -= amount;
        (bool sent, ) = ngo.call{value: amount}("");
        require(sent, "Anticipatory transfer failed");
        emit AnticipatoryFundsReleased(projectId, ngo, amount, severityScore);
    }
}
