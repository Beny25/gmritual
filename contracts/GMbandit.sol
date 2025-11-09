// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GMbandit is Ownable {
    string public message;
    uint256 public lastUpdated;

    event MessageUpdated(string newMessage, uint256 timestamp);

    constructor(string memory _initialMessage, address _owner) Ownable(_owner) {
        message = _initialMessage;
        lastUpdated = block.timestamp;
    }

    function updateMessage(string memory _newMessage) public onlyOwner {
        message = _newMessage;
        lastUpdated = block.timestamp;
        emit MessageUpdated(_newMessage, block.timestamp);
    }
}
