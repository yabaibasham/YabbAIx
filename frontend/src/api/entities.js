import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function makeEntity(endpoint) {
  return {
    list: async (params) => {
      const res = await axios.get(`${API}/${endpoint}`, { params });
      return res.data;
    },
    create: async (data) => {
      const res = await axios.post(`${API}/${endpoint}`, data);
      return res.data;
    },
    update: async (id, data) => {
      const res = await axios.put(`${API}/${endpoint}/${id}`, data);
      return res.data;
    },
    delete: async (id) => {
      const res = await axios.delete(`${API}/${endpoint}/${id}`);
      return res.data;
    },
    filter: async (params) => {
      const res = await axios.get(`${API}/${endpoint}`, { params });
      return res.data;
    },
  };
}

export const Signal = makeEntity("signals");
export const Lead = makeEntity("leads");
export const DigitalAsset = makeEntity("digital-assets");
export const Timeline = makeEntity("timelines");
export const GoldFinding = makeEntity("gold-findings");
export const VaultEntry = makeEntity("vault");

export async function getVaultSummary() {
  const res = await axios.get(`${API}/vault/summary`);
  return res.data;
}

export async function getSwarmStatus() {
  const res = await axios.get(`${API}/swarm/status`);
  return res.data;
}

export async function startSwarm() {
  const res = await axios.post(`${API}/swarm/start`);
  return res.data;
}

export async function stopSwarm() {
  const res = await axios.post(`${API}/swarm/stop`);
  return res.data;
}

export async function runSwarmOnce() {
  const res = await axios.post(`${API}/swarm/run-once`);
  return res.data;
}

export async function runAgent(role) {
  const res = await axios.post(`${API}/swarm/run-agent/${role}`);
  return res.data;
}

export async function getDashboardData() {
  const res = await axios.get(`${API}/dashboard`);
  return res.data;
}

export async function getTreasuryStatus() {
  const res = await axios.get(`${API}/treasury/status`);
  return res.data;
}

export async function startTreasury() {
  const res = await axios.post(`${API}/treasury/start`);
  return res.data;
}

export async function stopTreasury() {
  const res = await axios.post(`${API}/treasury/stop`);
  return res.data;
}

export async function distributeNow() {
  const res = await axios.post(`${API}/treasury/distribute-now`);
  return res.data;
}

export async function resetCircuitBreaker() {
  const res = await axios.post(`${API}/treasury/reset-circuit-breaker`);
  return res.data;
}

export async function resetGasHalt() {
  const res = await axios.post(`${API}/treasury/reset-gas-halt`);
  return res.data;
}

export async function getTreasuryHistory() {
  const res = await axios.get(`${API}/treasury/history`);
  return res.data;
}

export async function getWatchdogStatus() {
  const res = await axios.get(`${API}/watchdog/status`);
  return res.data;
}

export async function triggerWatchdog() {
  const res = await axios.post(`${API}/watchdog/check`);
  return res.data;
}

// Stripe Payments
export async function createCheckout(packageId, leadId) {
  const originUrl = window.location.origin;
  const res = await axios.post(`${API}/payments/checkout`, {
    package_id: packageId,
    lead_id: leadId || "",
    origin_url: originUrl,
  });
  return res.data;
}

export async function getPaymentStatus(sessionId) {
  const res = await axios.get(`${API}/payments/status/${sessionId}`);
  return res.data;
}

export async function getPaymentHistory() {
  const res = await axios.get(`${API}/payments/history`);
  return res.data;
}

export async function getReinvestment() {
  const res = await axios.get(`${API}/payments/reinvestment`);
  return res.data;
}

export async function getPaymentPackages() {
  const res = await axios.get(`${API}/payments/packages`);
  return res.data;
}
