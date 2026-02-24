// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Vault {
    using Math for uint256;

    IERC20 public immutable asset;

    uint256 public totalShares;
    uint256 private _totalAssets;

    mapping(address => uint256) public sharesOf;

    event Deposited(address indexed user, uint256 assets, uint256 shares);
    event Withdrawn(address indexed user, uint256 assets, uint256 shares);

    constructor(address _asset) {
        asset = IERC20(_asset);
    }

    function deposit(uint256 assets)
        external
        returns (uint256 shares)
    {
        require(assets > 0, "ZERO_ASSETS");

        uint256 balanceBefore = asset.balanceOf(address(this));
        asset.transferFrom(msg.sender, address(this), assets);
        uint256 received = asset.balanceOf(address(this)) - balanceBefore;
        require(received > 0, "ZERO_RECEIVED");

        if (totalShares == 0 || _totalAssets == 0) {
            // first deposit, mint 1:1
            shares = received;
        } else {
            // calculate shares based on previous totalAssets (before this deposit)
            shares = (received * totalShares) / _totalAssets;
            require(shares > 0, "ZERO_SHARES"); // reject deposits too small
        }

        sharesOf[msg.sender] += shares;
        totalShares += shares;
        _totalAssets += received;

        emit Deposited(msg.sender, received, shares);
    }

    function withdraw(uint256 shares)
        external
        returns (uint256 assets)
    {
        require(shares > 0, "ZERO_SHARES");
        uint256 userShares = sharesOf[msg.sender];
        require(userShares >= shares, "INSUFFICIENT_SHARES");

        // calculate assets proportional to shares (floor division to avoid over-withdraw)
        assets = (shares * _totalAssets) / totalShares;
        require(assets > 0, "ZERO_ASSETS");

        sharesOf[msg.sender] -= shares;
        totalShares -= shares;
        _totalAssets -= assets;

        asset.transfer(msg.sender, assets);

        emit Withdrawn(msg.sender, assets, shares);
    }

    function totalAssets() external view returns (uint256) {
        return _totalAssets;
    }

    function sharePrice() public view returns (uint256) {
    if (totalShares == 0) return 1e18;
    return Math.mulDiv(_totalAssets, 1e18, totalShares);
    }
}