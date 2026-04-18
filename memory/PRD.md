# YABAI Gold-Hunter PRD

## Original Problem Statement
Upgrade the YABAI application (autonomous agentic system for Melbourne law firm lead generation) with a "Gold-Mining" layer for 24/7 autonomous income generation. Add: 3-agent swarm (Sentinel/Scraper/Janitor), blockchain integration (Base L2/Sui), autonomous vault for yield tracking, swarm management, and Sovereign Vault Treasury with tiered profit distribution.

## Architecture
- **Stack**: React (frontend) + FastAPI (backend) + MongoDB
- **LLM Integration**: Emergent Universal Key → GPT-5.2 (Sentinel), Gemini 3 Flash (Scraper), Claude Sonnet (Janitor)
- **Blockchain**: Base L2 (Chain ID 8453) + Sui (Mainnet) — scaffolded
- **Agents**: 3 background workers managed by FastAPI BackgroundTasks
- **Treasury**: Tiered 30/5/95 profit distribution with circuit breaker
- **Watchdog**: 60s self-healing health checks

## User Personas
1. **Thomas Basham** (Owner) — Melbourne-based, scaling autonomous income via AI agents
2. **Partner/Investor** — VIP access via Partner View (key: BASHAM2026)
3. **Law Firm Leads** — Melbourne firms targeted for $97 audits → $1,500 retainers

## Core Requirements (Static)
- [x] Gold-Hunter swarm with 3 specialized agents
- [x] Signal entity extended with estimated_profit, execution_link, discovery_source
- [x] Non-blocking GoldHunter loop (every 5 minutes)
- [x] Scout logic for on-chain (Base/Sui) and off-chain (web) opportunities
- [x] Autonomous Vault for 24/7 income tracking
- [x] Sovereign Vault Treasury with 30/5/95 tiered distribution
- [x] Self-healing watchdog with autonomous maintenance
- [x] RULES.md frozen logic governance
- [x] CHANGELOG.md version tracking
- [x] Circuit breaker safety (2 failed withdrawals = pause)
- [x] Gas reserve constraints (0.01 ETH Base, 5 SUI)

## What's Been Implemented (2026-01-18)
### Backend (FastAPI + MongoDB)
- 25+ API endpoints (all tested, passing)
- Entity models: Signal, Lead, DigitalAsset, Timeline, GoldFinding, VaultEntry
- Gold-Hunter workers: sentinel_cycle (GPT-5.2), scraper_cycle (Gemini Flash), janitor_cycle (Claude Sonnet)
- Treasury system: tiered 30/5/95 distribution, circuit breaker, hard gas floor (0.005 ETH)
- Telegram notification engine (scaffolded): Profit Realized, Circuit Breaker, Gas Floor alerts
- Watchdog: 60s health checks, auto-restart, Telegram/destination config monitoring
- Gas floor halt with manual override endpoint
- AUD cashout flow: Agent → Coinspot Base L2 → PayID → CommBank/Bendigo
- Seed data: 5 timelines, 5 gold findings, 3 vault entries

### Frontend (React + Tailwind)
- 9 pages: Dashboard, Gold Hunter, Treasury, Control Room, Strike Deck, Rover, Capital Colony, Legal Colony, Partner View
- Treasury Safety tab: Gas floor, circuit breaker, AUD cashout guide, PayID tip
- Dark theme (#080808) with gold accents (#FFB800)
- All interactive elements have data-testid attributes

### Governance Files
- RULES.md: Sovereign rules with hardened gas floor and bank safety
- CHANGELOG.md: Version history (v1.0 → v2.0 → v2.1 → v2.2)

## Prioritized Backlog
### P0 (Critical — Next)
- [ ] User provides WITHDRAWAL_DESTINATION address → enable live withdrawals
- [ ] Wire OpenClaw wallet-manager skill for real on-chain transfers

### P1 (High — Near-term)
- [ ] Real blockchain RPC integration (Base/Sui balance queries)
- [ ] Telegram notification integration for treasury events
- [ ] Fixer agent for autonomous error resolution

### P2 (Medium — Scaling)
- [ ] Multi-chain dust recovery automation
- [ ] AI-powered lead scoring from Signal entity
- [ ] Email sending integration (SendGrid/Resend) for Control Room
- [ ] Real-time WebSocket updates for swarm status

## Next Tasks
1. Configure WITHDRAWAL_DESTINATION with Coinspot/Coinbase deposit address
2. Integrate OpenClaw wallet-manager for real Base L2 transfers
3. Add Telegram bot notifications for treasury distributions
4. Build real blockchain balance queries (replace scaffolded gas reserve check)
