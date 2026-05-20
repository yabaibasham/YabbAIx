"""
YABBAI v5 Backend API Tests
Tests for the new Solana DeFi ecosystem endpoints
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestYabbaiV5Root:
    """Test root endpoint returns YABBAI v5 version"""
    
    def test_root_returns_v5(self):
        """GET /api/ returns YABBAI v5 version 5.0"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "version" in data
        assert data["version"] == "5.0"
        assert "YABBAI" in data.get("message", "")
        print(f"✓ Root returns version {data['version']}")


class TestYabbaiTreasury:
    """Test YABBAI treasury endpoint"""
    
    def test_treasury_returns_wallets_and_tokens(self):
        """GET /api/yabbai/treasury returns wallets (holding + transacting) and 5 tokens"""
        response = requests.get(f"{BASE_URL}/api/yabbai/treasury")
        assert response.status_code == 200
        data = response.json()
        
        # Check wallets
        assert "wallets" in data
        wallets = data["wallets"]
        assert "holding" in wallets
        assert "transacting" in wallets
        assert wallets["holding"]["address"] == "2FgWQhgULDkUbhEVNLuUoNZUqVSUR4DALoayAbzRPbeN"
        assert wallets["transacting"]["address"] == "14Ezcns5v3bWYZywMRvD2acLFjh4YLiFmTySmS7HnebB"
        print(f"✓ Treasury has holding wallet: {wallets['holding']['address'][:12]}...")
        print(f"✓ Treasury has transacting wallet: {wallets['transacting']['address'][:12]}...")
        
        # Check 5 tokens
        assert "tokens" in data
        tokens = data["tokens"]
        expected_tokens = ["YABBAI", "BASH", "YABBIE", "HOMEGROWN", "GREENHOUSEGROW"]
        for token in expected_tokens:
            assert token in tokens, f"Missing token: {token}"
        print(f"✓ Treasury has all 5 tokens: {list(tokens.keys())}")
        
        # Check ecosystem stats
        assert "ecosystem_stats" in data
        stats = data["ecosystem_stats"]
        assert "total_missions" in stats
        assert "active_missions" in stats
        print(f"✓ Ecosystem stats: {stats['total_missions']} missions, {stats['active_missions']} active")


class TestYabbaiPumpScanner:
    """Test pump scanner endpoint"""
    
    def test_pump_scanner_returns_5_tokens_with_scores(self):
        """GET /api/yabbai/pump-scanner returns 5 tokens with scores and Jupiter links"""
        response = requests.get(f"{BASE_URL}/api/yabbai/pump-scanner")
        assert response.status_code == 200
        data = response.json()
        
        assert "tokens" in data
        tokens = data["tokens"]
        assert len(tokens) == 5, f"Expected 5 tokens, got {len(tokens)}"
        
        expected_symbols = ["YABBAI", "BASH", "YABBIE", "HOMEGROWN", "GREENHOUSEGROW"]
        for token in tokens:
            assert token["symbol"] in expected_symbols
            assert "score" in token
            assert isinstance(token["score"], int)
            assert 0 <= token["score"] <= 100
            assert "jupiter_link" in token
            assert "jup.ag" in token["jupiter_link"]
            assert "volume_24h" in token
            assert "holders" in token
            assert "liquidity" in token
            assert "momentum" in token
            assert "risk" in token
            print(f"✓ Token ${token['symbol']}: score={token['score']}, momentum={token['momentum']}, risk={token['risk']}")
        
        print(f"✓ Pump scanner returned {len(tokens)} tokens with Jupiter links")


class TestYabbaiMissions:
    """Test mission CRUD and yield ticking"""
    
    created_mission_id = None
    
    def test_create_mission_with_apy_formula(self):
        """POST /api/yabbai/missions creates mission with APY formula (risk*8+200 to risk*15+400)"""
        payload = {
            "name": "TEST_Alpha_Mission",
            "risk_level": 5,
            "deposit_amount": 0,
            "token": "YABBAI"
        }
        response = requests.post(f"{BASE_URL}/api/yabbai/missions", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        TestYabbaiMissions.created_mission_id = data["id"]
        
        # Verify APY formula: risk*8+200 to risk*15+400
        risk = 5
        expected_apy_low = risk * 8 + 200  # 240
        expected_apy_high = risk * 15 + 400  # 475
        
        assert data["apy_low"] == expected_apy_low, f"Expected APY low {expected_apy_low}, got {data['apy_low']}"
        assert data["apy_high"] == expected_apy_high, f"Expected APY high {expected_apy_high}, got {data['apy_high']}"
        assert data["apy_range"] == f"{expected_apy_low}%-{expected_apy_high}%"
        
        # Verify 4 strategies initialized
        assert "strategies" in data
        strategies = data["strategies"]
        expected_strategies = ["testnet", "perp_dex", "prediction", "stablecoin"]
        for sid in expected_strategies:
            assert sid in strategies, f"Missing strategy: {sid}"
            assert strategies[sid]["tokens_earned"] == 0.0
        
        print(f"✓ Created mission {data['id'][:8]}... with APY {data['apy_range']}")
        print(f"✓ Mission has 4 strategies: {list(strategies.keys())}")
    
    def test_list_missions(self):
        """GET /api/yabbai/missions lists missions"""
        response = requests.get(f"{BASE_URL}/api/yabbai/missions")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        # Should have at least the mission we created
        assert len(data) >= 1
        
        # Find our test mission
        test_missions = [m for m in data if m.get("name", "").startswith("TEST_")]
        assert len(test_missions) >= 1
        print(f"✓ Listed {len(data)} missions, {len(test_missions)} test missions")
    
    def test_tick_mission_increments_yield(self):
        """POST /api/yabbai/missions/{id}/tick increments yield tokens"""
        if not TestYabbaiMissions.created_mission_id:
            pytest.skip("No mission created")
        
        mission_id = TestYabbaiMissions.created_mission_id
        
        # Get initial state
        response = requests.get(f"{BASE_URL}/api/yabbai/missions/{mission_id}")
        assert response.status_code == 200
        initial = response.json()
        initial_tokens = initial.get("reward_tokens", 0)
        
        # Wait a moment then tick
        time.sleep(1)
        
        response = requests.post(f"{BASE_URL}/api/yabbai/missions/{mission_id}/tick")
        assert response.status_code == 200
        tick_data = response.json()
        
        assert "new_tokens" in tick_data
        assert "total_reward_tokens" in tick_data
        assert tick_data["new_tokens"] >= 0
        assert tick_data["total_reward_tokens"] >= initial_tokens
        
        print(f"✓ Tick added {tick_data['new_tokens']:.6f} tokens, total: {tick_data['total_reward_tokens']:.6f}")
    
    def test_get_single_mission(self):
        """GET /api/yabbai/missions/{id} returns mission details"""
        if not TestYabbaiMissions.created_mission_id:
            pytest.skip("No mission created")
        
        mission_id = TestYabbaiMissions.created_mission_id
        response = requests.get(f"{BASE_URL}/api/yabbai/missions/{mission_id}")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == mission_id
        assert "strategies" in data
        assert "reward_tokens" in data
        print(f"✓ Retrieved mission {mission_id[:8]}... with {data['reward_tokens']:.6f} reward tokens")


class TestYabbaiAgent:
    """Test AI agent chat endpoint"""
    
    def test_agent_chat_returns_response(self):
        """POST /api/yabbai/agent/chat returns AI response (via Emergent LLM fallback)"""
        payload = {
            "message": "What is YABBAI?",
            "model": "grok-3"
        }
        response = requests.post(f"{BASE_URL}/api/yabbai/agent/chat", json=payload, timeout=60)
        assert response.status_code == 200
        data = response.json()
        
        assert "reply" in data
        assert len(data["reply"]) > 0
        assert "model" in data
        print(f"✓ Agent responded with {len(data['reply'])} chars using model {data['model']}")
        print(f"  Response preview: {data['reply'][:100]}...")
    
    def test_agent_history_returns_messages(self):
        """GET /api/yabbai/agent/history returns message history"""
        response = requests.get(f"{BASE_URL}/api/yabbai/agent/history")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        # Should have at least the messages from previous test
        if len(data) > 0:
            msg = data[-1]
            assert "role" in msg
            assert "content" in msg
            print(f"✓ Agent history has {len(data)} messages")
        else:
            print("✓ Agent history is empty (no previous messages)")


class TestYabbaiEarlyAccess:
    """Test early access lead capture"""
    
    def test_early_access_saves_email(self):
        """POST /api/yabbai/early-access saves email lead"""
        payload = {
            "email": "TEST_user@example.com",
            "wallet_address": "TEST_wallet123",
            "referral_source": "testing"
        }
        response = requests.post(f"{BASE_URL}/api/yabbai/early-access", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data["email"] == payload["email"]
        assert data["wallet_address"] == payload["wallet_address"]
        print(f"✓ Early access lead saved: {data['email']}")


class TestYabbaiYieldSummary:
    """Test yield summary endpoint"""
    
    def test_yield_summary_returns_totals(self):
        """GET /api/yabbai/yield-summary returns reward token totals"""
        response = requests.get(f"{BASE_URL}/api/yabbai/yield-summary")
        assert response.status_code == 200
        data = response.json()
        
        assert "total_reward_tokens" in data
        assert "reward_token_value_usd" in data
        assert "missions_count" in data
        assert "by_strategy" in data
        
        # Verify USD value calculation (tokens * 0.001)
        expected_usd = data["total_reward_tokens"] * 0.001
        assert abs(data["reward_token_value_usd"] - expected_usd) < 0.0001
        
        print(f"✓ Yield summary: {data['total_reward_tokens']:.6f} tokens = ${data['reward_token_value_usd']:.6f}")
        print(f"  Missions: {data['missions_count']}, Strategies: {list(data['by_strategy'].keys())}")


class TestYabbaiUserBalance:
    """Test user balance endpoints"""
    
    def test_get_balance_for_new_wallet(self):
        """GET /api/yabbai/balance/{wallet} returns default for new wallet"""
        response = requests.get(f"{BASE_URL}/api/yabbai/balance/TEST_new_wallet_123")
        assert response.status_code == 200
        data = response.json()
        
        assert data["balance"] == 0.0
        assert data["reward_tokens"] == 0.0
        print("✓ New wallet returns zero balance")
    
    def test_deposit_minimum_validation(self):
        """POST /api/yabbai/deposit validates minimum $20"""
        response = requests.post(f"{BASE_URL}/api/yabbai/deposit", params={
            "wallet": "TEST_wallet",
            "amount": 10,
            "tx_hash": "test_tx"
        })
        assert response.status_code == 400
        print("✓ Deposit rejects amount below $20 minimum")
    
    def test_deposit_success(self):
        """POST /api/yabbai/deposit records valid deposit"""
        response = requests.post(f"{BASE_URL}/api/yabbai/deposit", params={
            "wallet": "TEST_deposit_wallet",
            "amount": 25,
            "tx_hash": "test_tx_hash_123"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data["balance"] == 25.0
        assert len(data["deposits"]) >= 1
        print(f"✓ Deposit recorded: ${data['balance']} balance")


class TestHealthAndDashboard:
    """Test health and dashboard endpoints"""
    
    def test_health_endpoint(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_dashboard_includes_yabbai_data(self):
        """GET /api/dashboard returns aggregate data"""
        response = requests.get(f"{BASE_URL}/api/dashboard")
        assert response.status_code == 200
        data = response.json()
        
        assert "timelines" in data
        assert "vault_summary" in data
        assert "treasury" in data
        print(f"✓ Dashboard: {len(data['timelines'])} timelines, treasury tier {data['treasury']['tier']}")


# Cleanup test data
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after all tests"""
    yield
    # Note: In production, would delete TEST_ prefixed records
    print("\n✓ Test session complete")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
