// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ReliefMath {
    /// @notice Ensures milestone allocations don't exceed project target
    function validateAllocations(uint256[] memory allocations, uint256 target) internal pure returns (bool) {
        uint256 total;
        for (uint i = 0; i < allocations.length; i++) { total += allocations[i]; }
        return total <= target;
    }
}
