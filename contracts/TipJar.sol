// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TipJar {
    struct Tip {
        address from;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    Tip[] public tips;
    address public owner;

    event NewTip(
        address indexed from,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    function sendTip(string calldata message) external payable {
        require(msg.value > 0, "Tip must be > 0");
        tips.push(Tip(msg.sender, msg.value, message, block.timestamp));
        emit NewTip(msg.sender, msg.value, message, block.timestamp);
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }

    function getAllTips() external view returns (Tip[] memory) {
        return tips;
    }
}
