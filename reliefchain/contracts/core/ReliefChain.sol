// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ReliefChain
/// @notice Entry-point contract — ties together Vault, Registry, Milestone, and DAO addresses.
contract ReliefChain {
    address public donationVault;
    address public projectRegistry;
    address public milestoneManager;
    address public daoGovernor;

    constructor(
        address _vault,
        address _registry,
        address _milestone,
        address _dao
    ) {
        donationVault = _vault;
        projectRegistry = _registry;
        milestoneManager = _milestone;
        daoGovernor = _dao;
    }
}
