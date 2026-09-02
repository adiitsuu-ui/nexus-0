// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title AegisDeadMansSwitch
 * @notice Timelocked Non-Custodial Heartbeat and Estate Inheritance Vault.
 * @dev Protects against permanent loss of crypto assets due to incapacitation or death.
 *      1. Owner registers a Beneficiary and an Inactivity Timeout (e.g., 90, 180, or 365 days).
 *      2. Owner calls pingHeartbeat() to refresh the countdown (or any Aegis interaction).
 *      3. If the timeout expires without a heartbeat ping, Beneficiary can execute the transfer.
 *      4. On execution, protocol fee (0.50%) is automatically streamed to the treasury.
 *      5. Owner can disarm or cancel at any time.
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
}

contract AegisDeadMansSwitch {
    using SafeERC20 for IERC20;

    address public immutable protocolOwner;
    address public treasury;
    uint16 public feeBps; // e.g., 50 bps = 0.50%
    uint256 public setupFeeWei; // e.g., ~$9.99 flat setup fee in native currency

    struct Vault {
        address beneficiary;
        uint256 timeoutSeconds;
        uint256 lastHeartbeat;
        bool isArmed;
    }

    mapping(address => Vault) public vaults;

    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    event SwitchArmed(address indexed owner, address indexed beneficiary, uint256 timeoutSeconds);
    event HeartbeatPinged(address indexed owner, uint256 newTimestamp);
    event SwitchDisarmed(address indexed owner);
    event InheritanceExecuted(
        address indexed owner,
        address indexed beneficiary,
        address indexed token,
        uint256 beneficiaryAmount,
        uint256 feeAmount
    );

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    modifier onlyProtocolOwner() {
        require(msg.sender == protocolOwner, "Only protocol owner");
        _;
    }

    constructor(address _treasury, uint16 _feeBps, uint256 _setupFeeWei) {
        require(_treasury != address(0), "Invalid treasury");
        protocolOwner = msg.sender;
        treasury = _treasury;
        feeBps = _feeBps;
        setupFeeWei = _setupFeeWei;
        _status = _NOT_ENTERED;
    }

    /**
     * @notice Arm the dead man's switch and pay the protocol setup fee directly to the treasury.
     * @param beneficiary Address receiving assets if timeout expires.
     * @param timeoutSeconds Duration of required heartbeat interval (min 30 days).
     */
    function armSwitch(address beneficiary, uint256 timeoutSeconds) external payable nonReentrant {
        require(beneficiary != address(0) && beneficiary != msg.sender, "Invalid beneficiary");
        require(timeoutSeconds >= 30 days, "Timeout must be at least 30 days");
        require(msg.value >= setupFeeWei, "Insufficient setup fee");

        // Forward setup fee immediately to treasury
        if (setupFeeWei > 0) {
            (bool feeSent, ) = treasury.call{value: setupFeeWei}("");
            require(feeSent, "Treasury setup fee forwarding failed");
        }

        // Refund any excess native payment
        uint256 excess = msg.value - setupFeeWei;
        if (excess > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: excess}("");
            require(refundSuccess, "Excess refund failed");
        }

        vaults[msg.sender] = Vault({
            beneficiary: beneficiary,
            timeoutSeconds: timeoutSeconds,
            lastHeartbeat: block.timestamp,
            isArmed: true
        });

        emit SwitchArmed(msg.sender, beneficiary, timeoutSeconds);
    }

    /**
     * @notice Refresh heartbeat to confirm owner is active and alive.
     */
    function pingHeartbeat() external {
        Vault storage vault = vaults[msg.sender];
        require(vault.isArmed, "Switch not armed");
        vault.lastHeartbeat = block.timestamp;
        emit HeartbeatPinged(msg.sender, block.timestamp);
    }

    /**
     * @notice Disarm the switch. Only the vault owner can call this.
     */
    function disarmSwitch() external {
        Vault storage vault = vaults[msg.sender];
        require(vault.isArmed, "Switch not armed");
        vault.isArmed = false;
        emit SwitchDisarmed(msg.sender);
    }

    /**
     * @notice Execute inheritance transfer if heartbeat timeout has elapsed.
     * @param vaultOwner The address of the inactive wallet owner.
     * @param token ERC20 token to transfer (vault contract must hold balance).
     */
    function executeInheritance(address vaultOwner, address token) external nonReentrant {
        Vault storage vault = vaults[vaultOwner];
        require(vault.isArmed, "Switch not armed");
        require(msg.sender == vault.beneficiary, "Only designated beneficiary can execute");
        require(
            block.timestamp >= vault.lastHeartbeat + vault.timeoutSeconds,
            "Heartbeat timeout has not yet elapsed"
        );

        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No token balance to distribute");

        uint256 fee = (balance * feeBps) / 10000;
        uint256 beneficiaryAmount = balance - fee;

        if (fee > 0) {
            IERC20(token).safeTransfer(treasury, fee);
        }
        IERC20(token).safeTransfer(vault.beneficiary, beneficiaryAmount);

        emit InheritanceExecuted(vaultOwner, vault.beneficiary, token, beneficiaryAmount, fee);
    }

    function setTreasury(address _newTreasury) external onlyProtocolOwner {
        require(_newTreasury != address(0), "Invalid treasury");
        treasury = _newTreasury;
    }

    function setFeeBps(uint16 _newFeeBps) external onlyProtocolOwner {
        require(_newFeeBps <= 200, "Fee cannot exceed 2.0%");
        feeBps = _newFeeBps;
    }

    function setSetupFeeWei(uint256 _newSetupFeeWei) external onlyProtocolOwner {
        setupFeeWei = _newSetupFeeWei;
    }
}
