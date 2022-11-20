// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title IGelatoUserProxy - solidity interface of GelatoConditionsStandard
/// @notice GelatoUserProxy.execute() API called by gelatoCore during .execute()
/// @dev all the APIs are implemented inside GelatoUserProxy
interface IGelatoUserProxy {
    function callAccount(address, bytes calldata)
        external
        payable
        returns (bool, bytes memory);

    function user() external view returns (address);
}
