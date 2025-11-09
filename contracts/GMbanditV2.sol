// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GMbanditV2 is Ownable {
    string public message;
    address public collector;
    uint256 public fee = 0.00000033 ether;

    event RitualPerformed(address indexed user, string message, uint256 timestamp);
    event CollectorUpdated(address indexed oldCollector, address indexed newCollector);

    constructor(address _owner, address _collector) Ownable(_owner) {
        collector = _collector;
        message = "GM Ritual Initiated ";
    }

    function setFee(uint256 _newFee) external onlyOwner {
        fee = _newFee;
    }

    function setCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid collector");
        emit CollectorUpdated(collector, _newCollector);
        collector = _newCollector;
    }

    function performRitual(string calldata newMessage) external payable {
        require(msg.value >= fee, "Not enough ritual fee");

        message = newMessage;
        payable(collector).transfer(msg.value);

        emit RitualPerformed(msg.sender, newMessage, block.timestamp);
    }
}
