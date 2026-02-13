# VAULT_SPEC.md

## 1. Purpose

The Vault is a deterministic staking contract implementing share-based accounting.

It accepts deposits of a single ERC20 asset and issues proportional shares.
Shares represent a claim on the vault’s underlying assets.

The contract is the canonical authority over:

- Asset custody
- Share accounting
- User balances
- Financial state transitions

No off-chain system may introduce financial state that cannot be reconstructed from chain state and emitted events.

---

## 2. Design Principles

1. Deterministic behavior
2. Minimal surface area
3. No hidden state
4. Event-complete reconstruction
5. No upgradeability (Phase 1)
6. No strategy logic (Phase 1)

---

## 3. Canonical State

### 3.1 Immutable Parameters

- `asset` → address  
  The ERC20 token accepted by the vault.

---

### 3.2 Storage Variables

- `totalShares` → uint256  
  Total shares issued by the vault.

- `mapping(address => uint256) sharesOf`  
  User share balances.

---

### 3.3 Derived On-Chain Values

- `totalAssets()` → uint256  
  Returns current ERC20 token balance of the vault.

Shares do NOT store asset value directly.
Asset value is derived from vault balance.

---

## 4. Share Model

The vault uses proportional share accounting.

### 4.1 Initial Deposit

If `totalShares == 0`:

sharesMinted = assetsDeposited

Initial share price = 1:1

---

### 4.2 Subsequent Deposits

sharesMinted = (assetsDeposited * totalShares) / totalAssets

---

### 4.3 Withdrawals

assetsReturned = (sharesBurned * totalAssets) / totalShares

---

### 4.4 Rounding

All division rounds down (Solidity default behavior).
No rounding compensation mechanism in Phase 1.

---

## 5. State Transitions

### 5.1 deposit(uint256 assets)

Requirements:

- assets > 0
- ERC20 transferFrom succeeds

Effects:

- Calculate sharesMinted
- Increase sharesOf[user]
- Increase totalShares
- Transfer assets to vault

Emits:

event Deposited(address indexed user, uint256 assets, uint256 shares);

---

### 5.2 withdraw(uint256 shares)

Requirements:

- shares > 0
- sharesOf[user] >= shares

Effects:

- Calculate assetsReturned
- Decrease sharesOf[user]
- Decrease totalShares
- Transfer assets to user

Emits:

event Withdrawn(address indexed user, uint256 assets, uint256 shares);

---

## 6. Events

event Deposited(address indexed user, uint256 assets, uint256 shares);

event Withdrawn(address indexed user, uint256 assets, uint256 shares);

---

## 7. Invariants

The following must always hold:

1. totalShares == sum(sharesOf[all users])
2. Vault ERC20 balance >= totalAssets() expectation
3. No shares can exist without corresponding assets
4. A user cannot withdraw more shares than owned
5. totalShares can only change via deposit or withdraw

---

## 8. Security Model (Phase 1)

- No admin
- No pausing
- No upgradeability
- No emergency controls
- No strategy execution
- No external calls besides ERC20 transfer/transferFrom

This ensures minimal attack surface.

---

## 9. Non-Goals (Phase 1)

The following are intentionally excluded:

- Reward emissions
- Yield strategies
- Governance
- Fee mechanisms
- Meta-transactions
- Upgrade patterns
- Multi-asset support

---

## 10. Backend Assumptions

The backend must assume:

- All authoritative financial state lives on-chain.
- All derived state must be reconstructible from:
  - Deposited events
  - Withdrawn events
  - totalShares()
  - sharesOf(address)
  - totalAssets()

If the backend cannot deterministically reconstruct user position history, the event model is incomplete.

---

## 11. Extensibility Path

Future phases may introduce:

- Yield distribution
- Performance fees
- Strategy adapters
- Upgradeability patterns
- Multi-vault registry
- Meta-transaction relaying

These MUST preserve the canonical share accounting model defined here.