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

    function deposit(uint256 assets) external {
        revert("NOT_IMPLEMENTED");
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