"""
YABAI Gold-Hunter API Tests
Tests for: Dashboard, Treasury, Watchdog, Swarm, Gold Findings, Vault, Leads
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://agent-swarm-8.preview.emergentagent.com').rstrip('/')


class TestHealthAndRoot:
    """Basic health and root endpoint tests"""
    
    def test_root_returns_api_info(self):
        """GET /api/ returns YABAI Gold-Hunter API v2.0"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "YABAI Gold-Hunter API"
        assert data["version"] == "2.0"
        assert data["status"] == "operational"
        print("✓ Root endpoint returns correct API info")
    
    def test_health_returns_healthy(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "swarm_running" in data
        print(f"✓ Health endpoint OK, swarm_running: {data['swarm_running']}")


class TestDashboard:
    """Dashboard aggregate endpoint tests"""
    
    def test_dashboard_returns_all_data(self):
        """GET /api/dashboard returns timelines, gold_findings, vault_summary, treasury, watchdog"""
        response = requests.get(f"{BASE_URL}/api/dashboard")
        assert response.status_code == 200
        data = response.json()
        
        # Check all required fields exist
        assert "timelines" in data
        assert "gold_findings" in data
        assert "vault_summary" in data
        assert "treasury" in data
        assert "watchdog" in data
        assert "swarm_running" in data
        assert "leads_count" in data
        assert "signals_count" in data
        
        # Validate timelines structure
        assert isinstance(data["timelines"], list)
        if len(data["timelines"]) > 0:
            tl = data["timelines"][0]
            assert "id" in tl
            assert "name" in tl
            assert "status" in tl
        
        # Validate treasury structure
        treasury = data["treasury"]
        assert "tier" in treasury
        assert "net_profit" in treasury
        assert "circuit_breaker" in treasury
        
        # Validate watchdog structure
        watchdog = data["watchdog"]
        assert "status" in watchdog
        assert "health_checks" in watchdog
        
        print(f"✓ Dashboard returns all data: {len(data['timelines'])} timelines, {len(data['gold_findings'])} findings")


class TestTreasury:
    """Treasury/Sovereign Vault endpoint tests"""
    
    def test_treasury_status(self):
        """GET /api/treasury/status returns tier info, net_profit, destination status, gas reserves"""
        response = requests.get(f"{BASE_URL}/api/treasury/status")
        assert response.status_code == 200
        data = response.json()
        
        # Required fields
        assert "tier" in data
        assert "net_profit" in data
        assert "destination_configured" in data
        assert "destination_preview" in data
        assert "withdrawal_network" in data
        assert "gas_reserve_eth" in data
        assert "gas_reserve_sui" in data
        assert "circuit_breaker_active" in data
        assert "log_entries" in data
        
        # Validate types
        assert isinstance(data["tier"], int)
        assert isinstance(data["net_profit"], (int, float))
        assert isinstance(data["destination_configured"], bool)
        
        print(f"✓ Treasury status: Tier {data['tier']}, Net profit: ${data['net_profit']:.2f}, Destination: {data['destination_preview']}")
    
    def test_treasury_distribute_now(self):
        """POST /api/treasury/distribute-now triggers manual distribution"""
        response = requests.post(f"{BASE_URL}/api/treasury/distribute-now")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "distribution" in data["message"].lower() or "triggered" in data["message"].lower()
        print(f"✓ Distribute now triggered: {data['message']}")
    
    def test_treasury_reset_circuit_breaker(self):
        """POST /api/treasury/reset-circuit-breaker resets the circuit breaker"""
        response = requests.post(f"{BASE_URL}/api/treasury/reset-circuit-breaker")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "reset" in data["message"].lower() or "circuit" in data["message"].lower()
        print(f"✓ Circuit breaker reset: {data['message']}")
    
    def test_treasury_history(self):
        """GET /api/treasury/history returns withdrawal history"""
        response = requests.get(f"{BASE_URL}/api/treasury/history")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # If there are withdrawals, validate structure
        if len(data) > 0:
            w = data[0]
            assert "amount" in w
            assert "entry_type" in w
            assert w["entry_type"] == "withdrawal"
        print(f"✓ Treasury history: {len(data)} withdrawals")


class TestWatchdog:
    """Watchdog/Self-healing endpoint tests"""
    
    def test_watchdog_status(self):
        """GET /api/watchdog/status returns health checks and issues"""
        response = requests.get(f"{BASE_URL}/api/watchdog/status")
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "health_checks" in data
        assert "auto_restarts" in data
        assert "issues_detected" in data
        assert "log_entries" in data
        
        assert isinstance(data["health_checks"], int)
        assert isinstance(data["issues_detected"], list)
        
        print(f"✓ Watchdog status: {data['health_checks']} checks, {len(data['issues_detected'])} issues")
    
    def test_watchdog_trigger_check(self):
        """POST /api/watchdog/check triggers watchdog health check"""
        response = requests.post(f"{BASE_URL}/api/watchdog/check")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Watchdog check triggered: {data['message']}")


class TestSwarm:
    """Swarm/Agent endpoint tests"""
    
    def test_swarm_status_returns_3_agents(self):
        """GET /api/swarm/status returns 3 agents with blockchain config"""
        response = requests.get(f"{BASE_URL}/api/swarm/status")
        assert response.status_code == 200
        data = response.json()
        
        assert "swarm_running" in data
        assert "agents" in data
        assert "blockchain_config" in data
        
        # Validate 3 agents
        agents = data["agents"]
        assert len(agents) == 3
        
        agent_roles = [a["role"] for a in agents]
        assert "sentinel" in agent_roles
        assert "scraper" in agent_roles
        assert "janitor" in agent_roles
        
        # Validate agent structure
        for agent in agents:
            assert "agent_name" in agent
            assert "role" in agent
            assert "status" in agent
            assert "findings_count" in agent
            assert "model_used" in agent
        
        # Validate blockchain config
        bc = data["blockchain_config"]
        assert "base" in bc
        assert "sui" in bc
        assert bc["base"]["chain_id"] == 8453
        
        print(f"✓ Swarm status: {len(agents)} agents, running: {data['swarm_running']}")
    
    def test_swarm_run_once(self):
        """POST /api/swarm/run-once triggers all 3 agents"""
        response = requests.post(f"{BASE_URL}/api/swarm/run-once")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Swarm run-once triggered: {data['message']}")


class TestGoldFindings:
    """Gold Findings CRUD tests"""
    
    def test_list_gold_findings(self):
        """GET /api/gold-findings returns seeded findings"""
        response = requests.get(f"{BASE_URL}/api/gold-findings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            f = data[0]
            assert "id" in f
            assert "agent_role" in f
            assert "title" in f
            assert "estimated_profit" in f
            assert "status" in f
            assert "network" in f
        
        print(f"✓ Gold findings: {len(data)} findings")
    
    def test_update_finding_status_to_executed(self):
        """PUT /api/gold-findings/{id} updates finding status to EXECUTED"""
        # First get a pending finding
        response = requests.get(f"{BASE_URL}/api/gold-findings")
        assert response.status_code == 200
        findings = response.json()
        
        pending = [f for f in findings if f.get("status") == "PENDING_EXECUTION"]
        if len(pending) == 0:
            pytest.skip("No pending findings to test update")
        
        finding = pending[0]
        finding_id = finding["id"]
        
        # Update to EXECUTED
        update_response = requests.put(
            f"{BASE_URL}/api/gold-findings/{finding_id}",
            json={"status": "EXECUTED"}
        )
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["status"] == "EXECUTED"
        
        # Verify persistence
        verify_response = requests.get(f"{BASE_URL}/api/gold-findings")
        verify_data = verify_response.json()
        updated_finding = next((f for f in verify_data if f["id"] == finding_id), None)
        assert updated_finding is not None
        assert updated_finding["status"] == "EXECUTED"
        
        print(f"✓ Updated finding {finding_id[:8]}... to EXECUTED")


class TestVault:
    """Vault endpoint tests"""
    
    def test_vault_summary(self):
        """GET /api/vault/summary returns income breakdown by agent and network"""
        response = requests.get(f"{BASE_URL}/api/vault/summary")
        assert response.status_code == 200
        data = response.json()
        
        assert "total_income" in data
        assert "total_expense" in data
        assert "net" in data
        assert "by_agent" in data
        assert "by_network" in data
        assert "entry_count" in data
        
        assert isinstance(data["by_agent"], dict)
        assert isinstance(data["by_network"], dict)
        
        print(f"✓ Vault summary: Income ${data['total_income']:.2f}, Net ${data['net']:.2f}")


class TestLeads:
    """Leads CRUD tests"""
    
    def test_create_lead(self):
        """POST /api/leads creates a new lead"""
        lead_data = {
            "business_name": "TEST_Lead_" + str(int(time.time())),
            "suburb": "Melbourne",
            "business_type": "lawyer",
            "sector": "Legal",
            "google_rating": 4.5,
            "review_count": 50,
            "gap_score": 85,
            "status": "Scouted"
        }
        
        response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data["business_name"] == lead_data["business_name"]
        assert data["suburb"] == lead_data["suburb"]
        assert data["status"] == "Scouted"
        
        # Store for cleanup
        self.__class__.created_lead_id = data["id"]
        print(f"✓ Created lead: {data['business_name']}")
    
    def test_list_leads(self):
        """GET /api/leads returns leads list"""
        response = requests.get(f"{BASE_URL}/api/leads")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Leads list: {len(data)} leads")
    
    def test_update_lead(self):
        """PUT /api/leads/{id} updates a lead"""
        # Get a lead to update
        response = requests.get(f"{BASE_URL}/api/leads")
        leads = response.json()
        
        if len(leads) == 0:
            pytest.skip("No leads to test update")
        
        lead = leads[0]
        lead_id = lead["id"]
        
        update_response = requests.put(
            f"{BASE_URL}/api/leads/{lead_id}",
            json={"status": "Email Drafted", "notes": "TEST update"}
        )
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["status"] == "Email Drafted"
        print(f"✓ Updated lead {lead_id[:8]}...")
    
    def test_delete_lead(self):
        """DELETE /api/leads/{id} deletes a lead"""
        # Create a lead to delete
        lead_data = {
            "business_name": "TEST_ToDelete_" + str(int(time.time())),
            "suburb": "Test",
            "status": "Scouted"
        }
        create_response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        assert create_response.status_code == 200
        lead_id = create_response.json()["id"]
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/api/leads/{lead_id}")
        assert delete_response.status_code == 200
        
        # Verify deletion
        verify_response = requests.get(f"{BASE_URL}/api/leads")
        leads = verify_response.json()
        deleted_lead = next((l for l in leads if l["id"] == lead_id), None)
        assert deleted_lead is None
        print(f"✓ Deleted lead {lead_id[:8]}...")


class TestSignals:
    """Signals endpoint tests"""
    
    def test_list_signals(self):
        """GET /api/signals returns signals list"""
        response = requests.get(f"{BASE_URL}/api/signals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Signals list: {len(data)} signals")
    
    def test_create_signal(self):
        """POST /api/signals creates a new signal"""
        signal_data = {
            "signal_type": "OpportunityDetected",
            "source": "TEST_Signal",
            "raw_data": "Test signal data",
            "score": 75,
            "estimated_profit": 100.0
        }
        
        response = requests.post(f"{BASE_URL}/api/signals", json=signal_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["signal_type"] == "OpportunityDetected"
        print(f"✓ Created signal: {data['id'][:8]}...")


class TestTimelines:
    """Timelines endpoint tests"""
    
    def test_list_timelines(self):
        """GET /api/timelines returns timelines list"""
        response = requests.get(f"{BASE_URL}/api/timelines")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Should have seeded timelines
        assert len(data) >= 5, "Expected at least 5 seeded timelines"
        
        # Validate structure
        if len(data) > 0:
            tl = data[0]
            assert "id" in tl
            assert "name" in tl
            assert "status" in tl
            assert "profit_signal" in tl
        
        print(f"✓ Timelines list: {len(data)} timelines")


class TestDigitalAssets:
    """Digital Assets endpoint tests"""
    
    def test_list_digital_assets(self):
        """GET /api/digital-assets returns assets list"""
        response = requests.get(f"{BASE_URL}/api/digital-assets")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Digital assets list: {len(data)} assets")
    
    def test_create_digital_asset(self):
        """POST /api/digital-assets creates a new asset"""
        asset_data = {
            "asset_type": "Email Capture",
            "title": "TEST_Asset_" + str(int(time.time())),
            "content": "test@example.com",
            "status": "Live",
            "niche": "legal-tech"
        }
        
        response = requests.post(f"{BASE_URL}/api/digital-assets", json=asset_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["title"] == asset_data["title"]
        print(f"✓ Created digital asset: {data['title']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
