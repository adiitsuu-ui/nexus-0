// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title NexusStakingVault
 * @notice Non-Custodial Real-Yield Staking Pool for NEXUS-0 ($NEX-0).
 * @dev Distributes 10% of all NEXUS-0 platform fee revenue to stakers.
 *      Zero token inflation: rewards are paid in real native ETH or protocol fee assets.
 *      Stakers receive VIP fee discounts on all NEXUS-0 terminal features (10% to 50%).
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

contract NexusStakingVault {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken; // $NEX-0 token
    address public immutable owner;

    struct StakePosition {
        uint256 amount;
        uint256 lockDuration;
        uint256 lockEndTime;
        uint256 rewardDebt;
    }

    mapping(address => StakePosition) public stakes;
    uint256 public totalStaked;
    uint256 public accRewardPerShare; // Accumulated rewards per staked token (scaled 1e12)

    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    event Staked(address indexed user, uint256 amount, uint256 lockDuration, uint256 lockEndTime);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 rewardAmount);
    event RevenueInjected(uint256 amount, uint256 newAccRewardPerShare);

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

    constructor(address _stakingToken) {
        require(_stakingToken != address(0), "Invalid staking token");
        owner = msg.sender;
        stakingToken = IERC20(_stakingToken);
        _status = _NOT_ENTERED;
    }

    /**
     * @notice Deposit protocol fee revenue directly into the real-yield pool.
     */
    receive() external payable {
        if (totalStaked > 0 && msg.value > 0) {
            accRewardPerShare += (msg.value * 1e12) / totalStaked;
            emit RevenueInjected(msg.value, accRewardPerShare);
        }
    }

    /**
     * @notice Stake $NEX-0 tokens with chosen lock duration.
     * @param amount Amount of tokens to stake.
     * @param lockDuration Duration in seconds (0 = flex, 30 days, 90 days, 365 days).
     */
    function stake(uint256 amount, uint256 lockDuration) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        StakePosition storage pos = stakes[msg.sender];

        // Claim pending rewards first
        if (pos.amount > 0) {
            uint256 pending = ((pos.amount * accRewardPerShare) / 1e12) - pos.rewardDebt;
            if (pending > 0) {
                (bool sent, ) = msg.sender.call{value: pending}("");
                require(sent, "Reward transfer failed");
                emit RewardClaimed(msg.sender, pending);
            }
        }

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        pos.amount += amount;
        pos.lockDuration = lockDuration;
        pos.lockEndTime = block.timestamp + lockDuration;
        pos.rewardDebt = (pos.amount * accRewardPerShare) / 1e12;
        totalStaked += amount;

        emit Staked(msg.sender, amount, lockDuration, pos.lockEndTime);
    }

    /**
     * @notice Claim accrued real-yield rewards without unstaking.
     */
    function claimRewards() external nonReentrant {
        StakePosition storage pos = stakes[msg.sender];
        require(pos.amount > 0, "No stake");

        uint256 pending = ((pos.amount * accRewardPerShare) / 1e12) - pos.rewardDebt;
        require(pending > 0, "No rewards accrued");

        pos.rewardDebt = (pos.amount * accRewardPerShare) / 1e12;

        (bool sent, ) = msg.sender.call{value: pending}("");
        require(sent, "Reward transfer failed");

        emit RewardClaimed(msg.sender, pending);
    }

    /**
     * @notice Unstake tokens after lock duration has elapsed.
     */
    function unstake(uint256 amount) external nonReentrant {
        StakePosition storage pos = stakes[msg.sender];
        require(pos.amount >= amount, "Exceeds staked balance");
        require(block.timestamp >= pos.lockEndTime, "Tokens are still timelocked");

        // Claim pending rewards
        uint256 pending = ((pos.amount * accRewardPerShare) / 1e12) - pos.rewardDebt;
        if (pending > 0) {
            (bool sent, ) = msg.sender.call{value: pending}("");
            require(sent, "Reward transfer failed");
            emit RewardClaimed(msg.sender, pending);
        }

        pos.amount -= amount;
        pos.rewardDebt = (pos.amount * accRewardPerShare) / 1e12;
        totalStaked -= amount;

        stakingToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }
}
