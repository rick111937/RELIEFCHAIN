// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol" as OZTimelock;

/// @title ReliefChainTimelock
/// @notice 24-hour timelock between DAO approval and fund release execution.
contract ReliefChainTimelock is OZTimelock.TimelockController {
    constructor(address[] memory proposers, address[] memory executors)
        OZTimelock.TimelockController(86400 /* 24 hours */, proposers, executors, address(0))
    {}
}
