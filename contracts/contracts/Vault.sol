// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Vault is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Math for uint256;

    IERC20 public immutable asset;

    uint256 public totalShares;
    uint256 public totalAssets;
    uint256 public maxDepositCap;

    mapping(address => uint256) public sharesOf;

    event Deposited(address indexed user, uint256 assets, uint256 shares);
    event Withdrawn(address indexed user, uint256 assets, uint256 shares);

    constructor(address _asset, uint256 _maxDepositCap) {
        require(_asset != address(0), "INVALID_ASSET");

        asset = IERC20(_asset);
        maxDepositCap = _maxDepositCap;
    }

    function deposit(uint256 assets)
        external
        nonReentrant
        returns (uint256 shares)
    {
        require(assets > 0, "ZERO_ASSETS");

        uint256 balanceBefore = asset.balanceOf(address(this));

        asset.safeTransferFrom(msg.sender, address(this), assets);

        uint256 received = asset.balanceOf(address(this)) - balanceBefore;

        require(received > 0, "ZERO_RECEIVED");

        require(
            totalAssets + received <= maxDepositCap,
            "DEPOSIT_CAP_EXCEEDED"
        );

        if (totalShares == 0 || totalAssets == 0) {
            shares = received;
        } else {
            shares = (received * totalShares) / totalAssets;
            require(shares > 0, "ZERO_SHARES");
        }

        sharesOf[msg.sender] += shares;
        totalShares += shares;
        totalAssets += received;

        emit Deposited(msg.sender, received, shares);
    }

    function withdraw(uint256 shares)
        external
        nonReentrant
        returns (uint256 assets)
    {
        require(shares > 0, "ZERO_SHARES");

        uint256 userShares = sharesOf[msg.sender];
        require(userShares >= shares, "INSUFFICIENT_SHARES");

        assets = (shares * totalAssets) / totalShares;
        require(assets > 0, "ZERO_ASSETS");

        sharesOf[msg.sender] = userShares - shares;
        totalShares -= shares;
        totalAssets -= assets;

        asset.safeTransfer(msg.sender, assets);

        emit Withdrawn(msg.sender, assets, shares);
    }

    function sharePrice()
        public
        view
        returns (uint256)
    {
        if (totalShares == 0) return 1e18;

        return Math.mulDiv(totalAssets, 1e18, totalShares);
    }

    function availableDeposit()
        external
        view
        returns (uint256)
    {
        return maxDepositCap > totalAssets
            ? maxDepositCap - totalAssets
            : 0;
    }

    function previewDeposit(uint256 assets)
        public
        view
        returns (uint256 shares)
    {
        if (assets == 0) return 0;

        if (totalShares == 0 || totalAssets == 0) {
            return assets;
        }

        return (assets * totalShares) / totalAssets;
    }

    function previewWithdraw(uint256 shares)
        public
        view
        returns (uint256 assets)
    {
        if (shares == 0 || totalShares == 0) return 0;

        return (shares * totalAssets) / totalShares;
    }
}