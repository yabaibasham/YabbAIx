# YABAI Gold-Hunter Changelog

## v2.2.0 — 2026-01-18
### Added
- Telegram notification engine (scaffolded — ready for BotFather tokens)
- Profit Realized alerts with "Ready to Cash Out" PayID instructions
- Circuit breaker emergency Telegram alerts
- Gas floor halt emergency Telegram alerts
- Hard gas floor: 0.005 ETH on Base = FULL HALT, no auto-resume
- Gas floor manual override endpoint (POST /api/treasury/reset-gas-halt)
- AUD Cashout Flow guide in Treasury Safety tab
- PayID tip for CommBank/Bendigo instant transfers
- Telegram configuration status in watchdog health checks
- Dual-model strategy: Gemini Flash (monitoring) / GPT-5.2 (verification)

## v2.1.0 — 2026-01-18
### Added
- Sovereign Vault Treasury system with tiered 30/5 withdrawal protocol
- Self-healing watchdog with autonomous maintenance loop
- RULES.md governance file for frozen logic
- Treasury dashboard UI with distribution history and tier status
- Circuit breaker for failed withdrawal attempts
- Gas reserve safety constraints (0.01 ETH Base, 5 SUI)

## v2.0.0 — 2026-01-18
### Added
- Gold-Hunter swarm layer (Sentinel/Scraper/Janitor)
- Base L2 and Sui blockchain scaffolding
- Autonomous Vault for 24/7 income tracking
- LLM integration via Emergent Universal Key (GPT-5.2, Gemini Flash, Claude Sonnet)
- 8-page React frontend (Dashboard, Gold Hunter, Control Room, Strike Deck, Rover, Capital Colony, Legal Colony, Partner View)
- MongoDB entity models (Signal, Lead, DigitalAsset, Timeline, GoldFinding, VaultEntry)
- Seed data for timelines, gold findings, and vault entries

## v1.0.0 — 2026-01-17
### Original
- Base44 platform app with Dashboard, ControlRoom, Rover, StrikeDeck views
- Melbourne law firm lead generation (14 firms, $58,560/mo gap)
- Thomas from Melbourne email voice system
- Signal/Lead/DigitalAsset/Timeline entities
