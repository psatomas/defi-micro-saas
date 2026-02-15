// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Deterministic Staking Vault
/// @notice Minimal share-based vault implementing VAULT_SPEC.md
contract Vault {

    // =============================================================
    //                            EVENTS
    // =============================================================

    event Deposited(address indexed user, uint256 assets, uint256 shares);

    event Withdrawn(address indexed user, uint256 assets, uint256 shares);


    // =============================================================
    //                       IMMUTABLE STORAGE
    // =============================================================

    IERC20 public immutable asset;


    // =============================================================
    //                         STATE STORAGE
    // =============================================================

    uint256 public totalShares;

    mapping(address => uint256) public sharesOf;


    // =============================================================
    //                          CONSTRUCTOR
    // =============================================================

    constructor(address _asset) {
        asset = IERC20(_asset);
    }


    // =============================================================
    //                      EXTERNAL FUNCTIONS
    // =============================================================

    function deposit(uint256 assets) external returns (uint256 shares) {

        require(assets > 0, "ZERO_ASSETS");

        uint256 _totalShares = totalShares;
        uint256 _totalAssets = totalAssets();

        if (_totalShares == 0) {
            shares = assets;
        } else {
            shares = (assets * _totalShares) / _totalAssets;
        }

        require(shares > 0, "ZERO_SHARES");

        sharesOf[msg.sender] += shares;
        totalShares = _totalShares + shares;

        bool success = asset.transferFrom(msg.sender, address(this), assets);
        require(success, "TRANSFER_FAILED");

        emit Deposited(msg.sender, assets, shares);

        return shares;
    }


    function withdraw(uint256 shares) external {
        revert("NOT_IMPLEMENTED");
    }


    // =============================================================
    //                        VIEW FUNCTIONS
    // =============================================================

    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

}