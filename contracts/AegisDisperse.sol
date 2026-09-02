// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title AegisDisperse
 * @notice Stateless multi-sender batch transfer with flat protocol fee forwarding.
 */

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract AegisDisperse {
    address public immutable owner;
    address payable public treasury;
    uint256 public flatFeeWei; // e.g. 0.0003 ETH (~$1)

    event DispersedNative(address indexed sender, uint256 totalAmount, uint256 recipientsCount);
    event DispersedToken(address indexed sender, address indexed token, uint256 totalAmount, uint256 recipientsCount);

    constructor(address payable _treasury, uint256 _flatFeeWei) {
        owner = msg.sender;
        treasury = _treasury;
        flatFeeWei = _flatFeeWei;
    }

    function disperseEther(address[] calldata recipients, uint256[] calldata values) external payable {
        require(recipients.length == values.length, "Length mismatch");
        require(msg.value >= flatFeeWei, "Insufficient fee");

        // Forward flat fee to treasury
        if (flatFeeWei > 0) {
            treasury.transfer(flatFeeWei);
        }

        uint256 totalValue = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            totalValue += values[i];
            payable(recipients[i]).transfer(values[i]);
        }

        require(msg.value >= totalValue + flatFeeWei, "Insufficient ETH sent");
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(msg.sender).transfer(balance);
        }

        emit DispersedNative(msg.sender, totalValue, recipients.length);
    }

    function disperseToken(
        IERC20 token,
        address[] calldata recipients,
        uint256[] calldata values
    ) external payable {
        require(recipients.length == values.length, "Length mismatch");
        require(msg.value >= flatFeeWei, "Fee required");

        if (flatFeeWei > 0) {
            treasury.transfer(flatFeeWei);
        }

        uint256 totalDispersed = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            totalDispersed += values[i];
            require(token.transferFrom(msg.sender, recipients[i], values[i]), "Transfer failed");
        }

        emit DispersedToken(msg.sender, address(token), totalDispersed, recipients.length);
    }
}
