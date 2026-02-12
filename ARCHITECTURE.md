ARCHITECTURE.md
1. System Overview

Project Name: defi-micro-saas
Classification: Modular DeFi-backed micro-SaaS platform
Primary Objective: Provide a minimal but extensible architecture that integrates on-chain logic with off-chain services in a scalable and infra-conscious manner.

This system is designed with long-term evolution in mind:

Transition from experimental DeFi application

Toward protocol-aware infrastructure tooling

With production-grade backend discipline

2. Architectural Philosophy

This project follows five guiding principles:

Clear separation of concerns

Chain state is authoritative for financial logic

Backend is authoritative for orchestration

Frontend is a pure interface layer

Infrastructure must be reproducible and deterministic

3. High-Level System Architecture
┌─────────────────────────────┐
│         Frontend            │
│  (React / Next / SPA)       │
│  - Wallet connection        │
│  - User dashboard           │
│  - Data visualization       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          Backend API        │
│      (Node + TypeScript)    │
│  - Business orchestration   │
│  - Indexing layer           │
│  - Caching                  │
│  - Auth (if needed)         │
│  - Chain interaction        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        Smart Contracts      │
│        (Solidity)           │
│  - Financial logic          │
│  - State transitions        │
│  - Immutable invariants     │
└─────────────────────────────┘

4. Layer Responsibilities
4.1 Smart Contract Layer (/contracts)
Responsibilities:

Core protocol logic

Asset custody rules

Validation of economic invariants

Deterministic state transitions

Design Constraints:

No off-chain trust assumptions

Explicit revert reasons

Gas-aware architecture

Unit-tested with deterministic scenarios

Contract Authority:

On-chain state is the source of truth for:

Balances

Positions

Ownership

Protocol configuration

4.2 Backend Layer (/backend)
Responsibilities:

Transaction construction and relaying

Data aggregation and indexing

Caching chain reads

Derived state computation

API exposure to frontend

Future: rate limiting, telemetry, billing

Backend Is NOT:

A financial authority

A custodian

A replacement for contract validation

Backend Is:

An orchestrator

A performance layer

A reliability abstraction

Design Direction:

Stateless API where possible

Deterministic config management

Environment-driven behavior

Prepared for containerization

4.3 Frontend Layer (/frontend)
Responsibilities:

Wallet connection

Transaction signing

UX state display

Interaction with backend APIs

Design Constraint:

Frontend should never:

Hold business-critical logic

Perform sensitive calculations

Assume authority over protocol state

5. Trust Model
Component	Trust Level
Contracts	Trustless
Backend	Semi-trusted orchestration
Frontend	Untrusted interface

The protocol must remain secure even if:

Backend is compromised

Frontend is manipulated

6. Data Flow Model
Read Flow:

Frontend → Backend

Backend → Chain RPC

Backend → Aggregate / cache

Backend → Frontend

Write Flow:

Frontend builds transaction

User signs with wallet

Transaction submitted to network

Backend listens/indexes event

Backend updates derived state

7. State Model

We differentiate:

7.1 Canonical State

Stored on-chain.

7.2 Derived State

Computed off-chain for:

Analytics

Performance dashboards

User aggregation

Query optimization

Derived state must always be reproducible from canonical state.

8. Deployment Model (Future-Ready)

Initial:

Local dev environment

Single-node backend

Public RPC provider

Next Stage:

Dockerized backend

Environment-based configuration

CI pipeline

Testnet deployment

Long-Term:

Kubernetes-ready services

Dedicated RPC node

Observability stack (Prometheus / Grafana)

Event indexing microservice

9. Scalability Strategy

Vertical First:

Cache optimization

Efficient contract calls

Batched reads

Horizontal Later:

Stateless API replication

Read replicas

Event indexer separation

10. Security Posture

No private keys stored server-side (unless explicitly designed)

Strict input validation

Environment isolation

Audit-ready contract structure

11. Evolution Path

Phase 1 – Functional DeFi SaaS
Phase 2 – Hardened architecture
Phase 3 – Infrastructure discipline
Phase 4 – Protocol tooling / infra expansion

12. Non-Goals (For Now)

Multi-chain abstraction

DAO governance

On-chain upgradeability

Tokenomics complexity

13. Immediate Next Technical Steps

Define contract interaction interface in backend

Implement typed chain client abstraction

Create environment configuration module

Add structured logging

Define event indexing pattern

14. Architectural North Star

This project is not just a dApp.

It is a controlled environment to:

Develop protocol awareness

Practice infra-conscious backend design

Build deterministic, reproducible systems

Transition toward protocol engineering