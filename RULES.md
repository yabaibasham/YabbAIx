# Yabai Gold-Hunter Sovereign Rules v1.0

## Core Mission
Autonomous scouting and profit recovery across Base L2 and Sui networks.
24/7 income generation via Sentinel/Scraper/Janitor swarm fleet.

## Withdrawal Logic (Sovereign Vault Protocol)
1. **Tier 1 (The Initial Payday):** If Net_Profit > $100 AUD, withdraw 30% to WITHDRAWAL_DESTINATION.
2. **Tier 2 (The Passive Stream):** After Tier 1 fulfilled, switch to 5% recurring withdrawal of Net_Profit.
3. **Tier 3 (The Compound):** Retain remaining 95% as working capital for gas, scaling, and deeper scouring.

## Safety Constraints
- **Hard Gas Floor:** 0.005 ETH on Base = FULL HALT. No automated resume. Manual override only after wallet top-up.
- **Circuit Breaker:** If withdrawal fails twice consecutively, pause treasury loop, send Telegram emergency alert, and do not resume until manual override.
- **Daily Max:** Operating costs capped at $50 AUD/day.
- **Bank Safety:** Always use PayID for Coinspot → CommBank/Bendigo AUD transfers. Never direct crypto deposit to bank.

## Maintenance Protocol
- Use 'Fixer' agent for errors, never 'Builder'.
- Do not refactor code unless a bug is present.
- Priority: Speed and Gas Efficiency.
- All changes must update CHANGELOG.md with version number.

## Agent Fleet Allocation
| Agent | Model | Role | Priority |
|-------|-------|------|----------|
| Sentinel | GPT-5.2 | Real-time market signals, deep pattern analysis | HIGH |
| Scraper | Gemini 3 Flash | High-volume web scouring, lead generation | MEDIUM |
| Janitor | Claude Sonnet | Asset recovery, transaction execution, treasury | HIGH |

## Capital Colony Integration
- Green Zone: Capital Colony aligned + signal >= 75 = auto-action
- Blue Zone: Future vault signals counted, never spawned
- Gold findings flow into Signal entity with status: PENDING_EXECUTION

## Profit Distribution Cadence
- Treasury cycle: Every 24 hours
- Swarm cycle: Every 5 minutes
- Watchdog health check: Every 60 seconds
