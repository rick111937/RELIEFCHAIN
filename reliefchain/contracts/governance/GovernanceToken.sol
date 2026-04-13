// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title GovernanceToken
/// @notice ERC20Votes token granting DAO voting rights to community members.
contract GovernanceToken is ERC20Votes, Ownable {
    constructor() ERC20("ReliefChain Governance", "RCG") EIP712("ReliefChain Governance", "1") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
