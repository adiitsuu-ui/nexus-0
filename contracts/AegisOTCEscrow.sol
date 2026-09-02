// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title AegisOTCEscrow
 * @notice Trustless P2P / OTC deal escrow for illiquid tokens and large whale trades.
 * @dev Enforces:
 *      1. Zero custodial pooling - deals expire and funds can be reclaimed at any time by maker.
 *      2. Counterparty validation - maker can restrict the deal to a single taker address.
 *      3. Direct fee deduction upon atomic execution.
 */

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract AegisOTCEscrow {
    address public immutable owner;
    address public treasury;
    uint16 public feeBps; // e.g. 25 = 0.25%

    struct Deal {
        address maker;
        address taker; // address(0) for public open order
        address tokenOffer;
        uint256 amountOffer;
        address tokenRequest;
        uint256 amountRequest;
        uint256 expiry;
        bool active;
    }

    mapping(bytes32 => Deal) public deals;
    uint256 public dealCount;

    event DealCreated(bytes32 indexed dealId, address indexed maker, address indexed taker);
    event DealFilled(bytes32 indexed dealId, address indexed taker);
    event DealCancelled(bytes32 indexed dealId, address indexed maker);

    constructor(address _treasury, uint16 _feeBps) {
        owner = msg.sender;
        treasury = _treasury;
        feeBps = _feeBps;
    }

    function createDeal(
        address _taker,
        address _tokenOffer,
        uint256 _amountOffer,
        address _tokenRequest,
        uint256 _amountRequest,
        uint256 _duration
    ) external returns (bytes32 dealId) {
        require(_amountOffer > 0 && _amountRequest > 0, "Invalid amounts");
        require(_duration >= 10 minutes && _duration <= 7 days, "Invalid duration");

        dealId = keccak256(abi.encodePacked(msg.sender, _taker, dealCount++, block.timestamp));
        
        deals[dealId] = Deal({
            maker: msg.sender,
            taker: _taker,
            tokenOffer: _tokenOffer,
            amountOffer: _amountOffer,
            tokenRequest: _tokenRequest,
            amountRequest: _amountRequest,
            expiry: block.timestamp + _duration,
            active: true
        });

        // Pull offer token from maker
        require(IERC20(_tokenOffer).transferFrom(msg.sender, address(this), _amountOffer), "Transfer failed");

        emit DealCreated(dealId, msg.sender, _taker);
    }

    function fillDeal(bytes32 dealId) external {
        Deal storage deal = deals[dealId];
        require(deal.active, "Deal not active");
        require(block.timestamp <= deal.expiry, "Deal expired");
        if (deal.taker != address(0)) {
            require(msg.sender == deal.taker, "Unauthorized taker");
        }

        deal.active = false;

        // Pull request token from taker
        uint256 fee = (deal.amountRequest * feeBps) / 10000;
        uint256 netMakerAmount = deal.amountRequest - fee;

        require(IERC20(deal.tokenRequest).transferFrom(msg.sender, address(this), deal.amountRequest), "Pull failed");

        // Forward fee to treasury
        if (fee > 0) {
            IERC20(deal.tokenRequest).transfer(treasury, fee);
        }

        // Send request tokens to maker
        IERC20(deal.tokenRequest).transfer(deal.maker, netMakerAmount);

        // Send offered tokens to taker
        IERC20(deal.tokenOffer).transfer(msg.sender, deal.amountOffer);

        emit DealFilled(dealId, msg.sender);
    }

    function cancelDeal(bytes32 dealId) external {
        Deal storage deal = deals[dealId];
        require(deal.active, "Deal not active");
        require(msg.sender == deal.maker, "Only maker can cancel");

        deal.active = false;
        require(IERC20(deal.tokenOffer).transfer(deal.maker, deal.amountOffer), "Refund failed");

        emit DealCancelled(dealId, msg.sender);
    }
}
