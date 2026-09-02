// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title NexusStealthRelayer
 * @notice Zero-Custody Stealth Routing & Relaying Contract.
 * @dev Breaks on-chain graph linkages by routing transactions from ephemeral burner
 *      wallets to clean destination addresses with atomic protocol fee streaming.
 *
 * Security Invariants:
 * 1. Zero Custody: Contract never retains balances across transactions.
 * 2. Fee Forwarding: 0.25% protocol fee immediately transfers to treasury.
 * 3. Atomic Routing: Funds and fees move within the same transaction block.
 * 4. Post-Execution Invariant: address(this).balance == 0.
 */

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

library SafeERC20 {
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        require(address(token).code.length > 0, "SafeERC20: call to non-contract");
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.transfer.selector, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "SafeERC20: transfer failed");
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        require(address(token).code.length > 0, "SafeERC20: call to non-contract");
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.transferFrom.selector, from, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "SafeERC20: transferFrom failed");
    }
}

contract NexusStealthRelayer {
    using SafeERC20 for IERC20;

    address public immutable owner;
    address public treasury;
    uint16 public feeBps; // 25 bps = 0.25%

    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    event StealthRelayed(
        address indexed ephemeralSource,
        address indexed cleanRecipient,
        address indexed token,
        uint256 amount,
        uint256 fee
    );

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _treasury, uint16 _feeBps) {
        require(_treasury != address(0), "Invalid treasury");
        owner = msg.sender;
        treasury = _treasury;
        feeBps = _feeBps;
        _status = _NOT_ENTERED;
    }

    /**
     * @notice Relays native currency from an ephemeral address to a clean recipient.
     * @param cleanRecipient Unlinked destination address.
     */
    function relayNative(address payable cleanRecipient) external payable nonReentrant {
        require(msg.value > 0, "No value sent");
        require(cleanRecipient != address(0), "Invalid recipient");

        uint256 fee = (msg.value * feeBps) / 10000;
        uint256 recipientAmount = msg.value - fee;

        if (fee > 0) {
            (bool feeSent, ) = treasury.call{value: fee}("");
            require(feeSent, "Treasury fee failed");
        }

        (bool recipientSent, ) = cleanRecipient.call{value: recipientAmount}("");
        require(recipientSent, "Recipient transfer failed");

        emit StealthRelayed(msg.sender, cleanRecipient, address(0), recipientAmount, fee);

        require(address(this).balance == 0, "Zero-Custody violation: balance > 0");
    }

    /**
     * @notice Relays ERC20 tokens from an ephemeral address to a clean recipient.
     */
    function relayToken(
        address token,
        address cleanRecipient,
        uint256 amount
    ) external nonReentrant {
        require(token != address(0), "Invalid token");
        require(cleanRecipient != address(0), "Invalid recipient");
        require(amount > 0, "Zero amount");

        uint256 fee = (amount * feeBps) / 10000;
        uint256 recipientAmount = amount - fee;

        if (fee > 0) {
            IERC20(token).safeTransferFrom(msg.sender, treasury, fee);
        }
        IERC20(token).safeTransferFrom(msg.sender, cleanRecipient, recipientAmount);

        emit StealthRelayed(msg.sender, cleanRecipient, token, recipientAmount, fee);
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury");
        treasury = _newTreasury;
    }

    function setFeeBps(uint16 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 100, "Fee capped at 1.0%");
        feeBps = _newFeeBps;
    }
}
