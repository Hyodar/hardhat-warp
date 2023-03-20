// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Storage {
    uint256 public value;
    address public immutable deployer;

    constructor(uint256 _value) {
        value = _value;
        deployer = msg.sender;
    }

    function get() public view returns (uint256) {
        return value;
    }

    function set(uint256 newValue) public {
        value = newValue;
    }
}
