# YABBAI v5 PRD — Gold-Hunter + Solana DeFi Ecosystem

## Original Problem Statement
Build YABBAI v5 as an autonomous multi-token Solana DeFi ecosystem layered on top of existing YABAI Gold-Hunter. Features: 5 interconnected tokens, mission operator with $0 capital background strategies, Grok xAI agent, pump scanner, yield tracking, treasury, autonomous income generation.

## Architecture
- **Stack**: React (frontend) + FastAPI (backend) + MongoDB
- **LLM**: Emergent Universal Key (GPT-5.2, Gemini Flash, Claude) + xAI Grok (when credits available)
- **Blockchain**: Base L2 + Sui (Gold-Hunter) + Solana (YABBAI v5)
- **Payments**: Stripe (95/5 revenue split)
- **Treasury**: 2 Solana wallets + Sovereign Vault (30/5/95 distribution)

## Token Ecosystem
1. $YABBAI — Main Hub
2. $BASH — Terminal/CTF
3. $YABBIE — Ocean Scout
4. $HOMEGROWN — AU Community
5. $GREENHOUSEGROW — Garden/Community

## What's Been Implemented
### YABBAI v5 DeFi Layer (2026-01-18)
- 7 new pages: Landing, Command Centre, Missions, Pump Scanner, Agent, Yield, Treasury
- Mission creator with APY formula (risk*8+200 to risk*15+400)
- 4 background $0 capital strategies with live ticking YABBAI Reward Tokens
- Grok xAI agent (falls back to GPT-5.2 when xAI has no credits)
- 6-factor pump scanner with Jupiter swap links
- Yield dashboard with strategy breakdown
- Treasury page with 2 Solana wallet addresses (Holding + Transacting)
- Early access form
- Cyberpunk design (#050808, Cyan #00F0FF, Purple #6B2FFF, Gold #F7B731, Orbitron font)

### Gold-Hunter Layer (preserved)
- 3-agent swarm (Sentinel/Scraper/Janitor)
- Sovereign Vault Treasury (30/5/95 tiered distribution)
- Telegram notification engine (scaffolded)
- Self-healing watchdog (60s cycles)
- Stripe payments with 95/5 revenue split
- Melbourne law firm pipeline (14 firms)
- RULES.md governance + CHANGELOG.md

### All Tests Passing
- Backend: 16/16 (100%)
- Frontend: All pages working (100%)

## MOCKED Components
- Pump scanner: Simulated token data
- Yield tokens: Simulated projections at ~$0.001 each
- xAI Grok: Falls back to GPT-5.2 via Emergent (xAI key needs credits)
- Withdrawal execution: Scaffolded (mock tx_hash)
- Gas balance queries: Scaffolded

## Prioritized Backlog
### P0
- [ ] Fund xAI account for native Grok agent
- [ ] Get real Supabase URL (current: MongoDB — working)
- [ ] Set WITHDRAWAL_DESTINATION for treasury cashout
- [ ] Phantom wallet connection (packages installed, UI scaffolding needed)

### P1
- [ ] Real Solana RPC integration for token balances
- [ ] Live Jupiter API integration for real-time pump scanner data
- [ ] Telegram bot setup (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID)
- [ ] Send 14 Melbourne law firm emails

### P2
- [ ] Actual on-chain token minting for YABBAI Reward Tokens
- [ ] Cross-chain bridge logic (Base ↔ Solana)
- [ ] Multi-wallet portfolio tracking
