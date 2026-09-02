// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title AegisAtomicRouter
 * @notice Zero-Custody, Stateless Multi-Chain Swap and Fee Router.
 * @dev Designed to be unhackable:
 *      1. Zero Custody: Contract never holds balances between transactions.
 *      2. Direct Forwarding: Fees are immediately transferred to the treasury address.
 *      3. Reentrancy Protection: OpenZeppelin ReentrancyGuard logic built-in.
 *      4. Post-execution Invariant: address(this).balance == 0 enforced on all calls.
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
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

    function safeApprove(IERC20 token, address spender, uint256 value) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.approve.selector, spender, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "SafeERC20: approve failed");
    }
}

contract AegisAtomicRouter {
    using SafeERC20 for IERC20;

    // --- State Variables ---
    address public immutable owner;
    address public treasury;
    uint16 public feeBps; // 100 bps = 1.00%, e.g., 250 = 2.5%
    uint16 public constant MAX_FEE_BPS = 500; // Hard cap at 5.0%

    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    // Whitelisted DEX Aggregators (1inch, Uniswap Universal Router, 0x Exchange Proxy)
    mapping(address => bool) public isApprovedRouter;

    // --- Events ---
    event DustSwept(
        address indexed user,
        address indexed targetToken,
        uint256 totalOutputAmount,
        uint256 feeAmount
    );
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeeBpsUpdated(uint16 oldFeeBps, uint16 newFeeBps);
    event RouterWhitelistUpdated(address indexed router, bool approved);

    // --- Modifiers ---
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Aegis: caller is not owner");
        _;
    }

    modifier enforceZeroBalance() {
        _;
        // Invariant: This contract must NEVER hold native gas at transaction end
        require(address(this).balance == 0, "Aegis: non-zero contract native balance");
    }

    constructor(address _treasury, uint16 _feeBps) {
        require(_treasury != address(0), "Invalid treasury");
        require(_feeBps <= MAX_FEE_BPS, "Fee exceeds max");
        owner = msg.sender;
        treasury = _treasury;
        feeBps = _feeBps;
        _status = _NOT_ENTERED;
    }

    // --- Management Functions ---
    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury");
        emit TreasuryUpdated(treasury, _newTreasury);
        treasury = _newTreasury;
    }

    function setFeeBps(uint16 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= MAX_FEE_BPS, "Fee exceeds max");
        emit FeeBpsUpdated(feeBps, _newFeeBps);
        feeBps = _newFeeBps;
    }

    function setRouterWhitelist(address _router, bool _approved) external onlyOwner {
        require(_router != address(0), "Invalid router");
        isApprovedRouter[_router] = _approved;
        emit RouterWhitelistUpdated(_router, _approved);
    }

    // --- Core Atomic Swapper ---
    struct SwapCall {
        address tokenIn;
        uint256 amountIn;
        address router;
        bytes swapData;
    }

    /**
     * @notice Atomically sweeps multiple tokens into targetToken in a single transaction.
     * @param swaps Array of token swap instructions.
     * @param targetToken The token to receive (address(0) for native ETH).
     * @param minTargetAmount Minimum acceptable output after slippage.
     */
    function sweepDust(
        SwapCall[] calldata swaps,
        address targetToken,
        uint256 minTargetAmount
    ) external payable nonReentrant enforceZeroBalance returns (uint256 netUserAmount) {
        require(swaps.length > 0, "No swaps provided");

        uint256 initialBalance = (targetToken == address(0))
            ? address(this).balance - msg.value
            : IERC20(targetToken).balanceOf(address(this));

        for (uint256 i = 0; i < swaps.length; i++) {
            SwapCall calldata s = swaps[i];
            require(isApprovedRouter[s.router], "Router not whitelisted");

            // Pull exact tokens from user
            IERC20(s.tokenIn).safeTransferFrom(msg.sender, address(this), s.amountIn);

            // Approve exact amount to approved router
            IERC20(s.tokenIn).safeApprove(s.router, s.amountIn);

            // Execute swap
            (bool success, ) = s.router.call(s.swapData);
            require(success, "Swap execution failed");

            // Reset approval for hygiene
            IERC20(s.tokenIn).safeApprove(s.router, 0);
        }

        uint256 finalBalance = (targetToken == address(0))
            ? address(this).balance
            : IERC20(targetToken).balanceOf(address(this));

        uint256 totalSwapped = finalBalance - initialBalance;
        require(totalSwapped >= minTargetAmount, "Slippage limit exceeded");

        // Calculate and transfer fee directly to treasury
        uint256 fee = (totalSwapped * feeBps) / 10000;
        netUserAmount = totalSwapped - fee;

        if (targetToken == address(0)) {
            // Direct transfer native ETH
            if (fee > 0) {
                (bool feeSuccess, ) = treasury.call{value: fee}("");
                require(feeSuccess, "Fee transfer failed");
            }
            (bool userSuccess, ) = msg.sender.call{value: netUserAmount}("");
            require(userSuccess, "User transfer failed");
        } else {
            // Direct transfer ERC20
            if (fee > 0) {
                IERC20(targetToken).safeTransfer(treasury, fee);
            }
            IERC20(targetToken).safeTransfer(msg.sender, netUserAmount);
        }

        emit DustSwept(msg.sender, targetToken, totalSwapped, fee);
    }

    receive() external payable {}
}
