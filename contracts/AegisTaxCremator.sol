// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title AegisTaxCremator
 * @notice Zero-Custody On-Chain Token Disposal and Tax-Loss Realization Contract.
 * @dev Allows crypto investors to dispose of unsellable, rugged, or dead tokens
 *      (where liquidity was pulled or honeypots prevent DEX sells) to generate a
 *      legally recognized on-chain disposal event for capital loss tax deductions.
 *
 * Security Invariants:
 * 1. Zero Custody: All incoming tokens are sent immediately to 0x...dEaD burn address.
 * 2. Direct Fee Streaming: Flat protocol fee in native currency streams straight to treasury.
 * 3. ReentrancyGuard: Prevents cross-function or reentrant callback exploits.
 * 4. Post-Execution Balance Invariant: address(this).balance == 0.
 */

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

library SafeERC20 {
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        require(address(token).code.length > 0, "SafeERC20: call to non-contract");
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.transferFrom.selector, from, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "SafeERC20: transferFrom failed");
    }
}

contract AegisTaxCremator {
    using SafeERC20 for IERC20;

    address public immutable owner;
    address public treasury;
    uint256 public flatFeeWei; // Flat protocol disposal fee (e.g., ~$2.50 in native ETH/BNB/MATIC)

    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    event DisposalCertificate(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 timestamp,
        uint256 chainId,
        bytes32 indexed certificateDigest
    );

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FlatFeeUpdated(uint256 oldFee, uint256 newFee);

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

    constructor(address _treasury, uint256 _flatFeeWei) {
        require(_treasury != address(0), "Invalid treasury");
        owner = msg.sender;
        treasury = _treasury;
        flatFeeWei = _flatFeeWei;
        _status = _NOT_ENTERED;
    }

    struct DisposalItem {
        address token;
        uint256 amount;
    }

    /**
     * @notice Batch burn worthless tokens and emit verifiable tax loss disposal certificates.
     * @param items Array of token addresses and amounts to cremate.
     */
    function cremateTokens(DisposalItem[] calldata items) external payable nonReentrant {
        require(msg.value >= flatFeeWei, "Insufficient protocol fee");
        require(items.length > 0, "No tokens provided");

        // Forward protocol fee immediately to treasury
        if (flatFeeWei > 0) {
            (bool feeSent, ) = treasury.call{value: flatFeeWei}("");
            require(feeSent, "Treasury fee forwarding failed");
        }

        // Refund any excess native payment
        uint256 excess = msg.value - flatFeeWei;
        if (excess > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: excess}("");
            require(refundSuccess, "Excess refund failed");
        }

        // Dispose each token by pulling directly to BURN_ADDRESS
        for (uint256 i = 0; i < items.length; i++) {
            require(items[i].amount > 0, "Zero amount");
            IERC20(items[i].token).safeTransferFrom(msg.sender, BURN_ADDRESS, items[i].amount);

            bytes32 certDigest = keccak256(
                abi.encodePacked(
                    msg.sender,
                    items[i].token,
                    items[i].amount,
                    block.timestamp,
                    block.chainid
                )
            );

            emit DisposalCertificate(
                msg.sender,
                items[i].token,
                items[i].amount,
                block.timestamp,
                block.chainid,
                certDigest
            );
        }

        // Zero-Custody Invariant: Contract must never retain native balance
        require(address(this).balance == 0, "Zero-Custody violation: balance > 0");
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury");
        emit TreasuryUpdated(treasury, _newTreasury);
        treasury = _newTreasury;
    }

    function setFlatFeeWei(uint256 _newFee) external onlyOwner {
        emit FlatFeeUpdated(flatFeeWei, _newFee);
        flatFeeWei = _newFee;
    }
}
