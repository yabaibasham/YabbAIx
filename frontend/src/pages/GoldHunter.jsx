import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getSwarmStatus, startSwarm, stopSwarm, runSwarmOnce, runAgent,
  GoldFinding, getVaultSummary, VaultEntry
} from "@/api/entities";
import {
  Zap, Play, Square, RefreshCw, Shield, Globe, Wrench,
  TrendingUp, ArrowUpRight, Clock, AlertCircle, CheckCircle2, XCircle
} from "lucide-react";

const AGENT_META = {
  sentinel: { name: "The Sentinel", icon: Shield, color: "var(--yb-sentinel)", model: "GPT-5.2", focus: "Real-time market signals" },
  scraper: { name: "The Scraper", icon: Globe, color: "var(--yb-scraper)", model: "Gemini 3 Flash", focus: "Web gold scouring" },
  janitor: { name: "The Janitor", icon: Wrench, color: "var(--yb-janitor)", model: "Claude Sonnet", focus: "Asset recovery" },
};

const STATUS_ICON = {
  PENDING_EXECUTION: Clock,
  EXECUTED: CheckCircle2,
  COLLECTED: ArrowUpRight,
  REJECTED: XCircle,
};

export default function GoldHunter() {
  const [swarm, setSwarm] = useState(null);
  const [findings, setFindings] = useState([]);
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAgent, setActiveAgent] = useState(null);
  const [findingFilter, setFindingFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      const [s, f, v] = await Promise.all([
        getSwarmStatus(),
        GoldFinding.list(),
        getVaultSummary(),
      ]);
      setSwarm(s);
      setFindings(Array.isArray(f) ? f : []);
      setVault(v);
    } catch (e) { logger.warn("GoldHunter load failed", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const iv = setInterval(load, 10000); return () => clearInterval(iv); }, [load]);

  const handleStart = async () => { await startSwarm(); load(); };
  const handleStop = async () => { await stopSwarm(); load(); };
  const handleRunOnce = async () => { await runSwarmOnce(); setTimeout(load, 2000); };
  const handleRunAgent = async (role) => { await runAgent(role); setTimeout(load, 2000); };

  const handleExecute = async (finding) => {
    await GoldFinding.update(finding.id, { status: "EXECUTED" });
    if (finding.estimated_profit > 0) {
      await VaultEntry.create({
        source: `Gold Finding: ${finding.title}`,
        amount: finding.estimated_profit,
        entry_type: "income",
        network: finding.network,
        agent_role: finding.agent_role,
        notes: `Executed from Gold-Hunter: ${finding.description?.slice(0, 100)}`,
      });
    }
    load();
  };

  const filteredFindings = useMemo(() =>
    findingFilter === "all" ? findings : findings.filter((f) => f.agent_role === findingFilter),
    [findings, findingFilter]
  );

  const agents = swarm?.agents || [];
  const isRunning = swarm?.swarm_running;

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-5 h-5 border-2 border-white/10 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div data-testid="gold-hunter-page" className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={18} style={{ color: "var(--yb-gold)" }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--yb-gold)" }}>
              Gold-Hunter Swarm
            </span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-sm"
              style={{
                color: isRunning ? "#22c55e" : "var(--yb-text-muted)",
                background: isRunning ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isRunning ? "rgba(34,197,94,0.2)" : "var(--yb-border)"}`,
              }}
            >
              {isRunning ? "ACTIVE" : "STANDBY"}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--yb-text-primary)" }}>
            Autonomous Income Generation
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--yb-text-muted)" }}>
            Sentinel / Scraper / Janitor — 24/7 on-chain and off-chain gold scouring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="btn-run-once"
            onClick={handleRunOnce}
            className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-2 rounded-sm transition-all"
            style={{ background: "rgba(255,255,255,0.04)", color: "var(--yb-text-secondary)", border: "1px solid var(--yb-border)" }}
          >
            <RefreshCw size={12} /> Run Once
          </button>
          {isRunning ? (
            <button
              data-testid="btn-stop-swarm"
              onClick={handleStop}
              className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-2 rounded-sm transition-all"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <Square size={12} /> Stop Swarm
            </button>
          ) : (
            <button
              data-testid="btn-start-swarm"
              onClick={handleStart}
              className="flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-sm transition-all"
              style={{ background: "var(--yb-gold)", color: "#000" }}
            >
              <Play size={12} /> Deploy Swarm
            </button>
          )}
        </div>
      </div>

      {/* Vault Summary */}
      {vault && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: `$${Math.round(vault.total_income || 0).toLocaleString()}`, l: "Total Income", c: "#22c55e" },
            { v: `$${Math.round(vault.net || 0).toLocaleString()}`, l: "Net Profit", c: "var(--yb-gold)" },
            { v: findings.filter((f) => f.status === "PENDING_EXECUTION").length, l: "Pending", c: "var(--yb-gold)" },
            { v: findings.filter((f) => f.status === "EXECUTED").length, l: "Executed", c: "#22c55e" },
          ].map((s) => (
            <div key={s.l} className="rounded-sm p-4" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
              <div className="text-xl font-black font-mono" style={{ color: s.c }}>{s.v}</div>
              <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "var(--yb-text-muted)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Agent Cards */}
      <div className="grid grid-cols-3 gap-3">
        {agents.map((agent) => {
          const meta = AGENT_META[agent.role] || {};
          const Icon = meta.icon || Shield;
          const isActive = agent.status === "running";
          const isOpen = activeAgent === agent.role;

          return (
            <div
              key={agent.role}
              data-testid={`agent-card-${agent.role}`}
              className="rounded-sm overflow-hidden transition-all"
              style={{
                background: "var(--yb-surface-1)",
                border: isActive ? `1px solid ${meta.color}40` : "1px solid var(--yb-border)",
              }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-sm flex items-center justify-center"
                      style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
                    >
                      <Icon size={16} style={{ color: meta.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: meta.color }}>{meta.name}</p>
                      <p className="text-[10px] font-mono" style={{ color: "var(--yb-text-muted)" }}>{meta.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${isActive ? "animate-pulse" : ""}`}
                      style={{ background: isActive ? meta.color : "var(--yb-text-muted)" }}
                    />
                    <span className="text-[10px] font-mono" style={{ color: isActive ? meta.color : "var(--yb-text-muted)" }}>
                      {agent.status}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] mb-3" style={{ color: "var(--yb-text-muted)" }}>{meta.focus}</p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-sm px-2 py-1.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[10px]" style={{ color: "var(--yb-text-muted)" }}>Findings</p>
                    <p className="text-sm font-bold font-mono" style={{ color: "var(--yb-text-primary)" }}>{agent.findings_count}</p>
                  </div>
                  <div className="rounded-sm px-2 py-1.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[10px]" style={{ color: "var(--yb-text-muted)" }}>Errors</p>
                    <p className="text-sm font-bold font-mono" style={{ color: agent.errors_count > 0 ? "#ef4444" : "var(--yb-text-primary)" }}>
                      {agent.errors_count}
                    </p>
                  </div>
                </div>

                {agent.current_task && (
                  <p className="text-[10px] font-mono mb-2 px-2 py-1 rounded-sm" style={{ color: meta.color, background: `${meta.color}08` }}>
                    {agent.current_task}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    data-testid={`run-${agent.role}`}
                    onClick={() => handleRunAgent(agent.role)}
                    className="flex-1 text-[10px] font-medium py-1.5 rounded-sm transition-all"
                    style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }}
                  >
                    Run Now
                  </button>
                  <button
                    onClick={() => setActiveAgent(isOpen ? null : agent.role)}
                    className="text-[10px] px-2 py-1.5 rounded-sm transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", color: "var(--yb-text-muted)", border: "1px solid var(--yb-border)" }}
                  >
                    Logs
                  </button>
                </div>
              </div>

              {isOpen && agent.log_entries?.length > 0 && (
                <div className="border-t px-3 py-2 max-h-32 overflow-y-auto" style={{ borderColor: "var(--yb-border)", background: "#0a0a0a" }}>
                  {agent.log_entries.map((entry, i) => (
                    <p key={`${agent.role}-log-${i}`} className="text-[10px] font-mono leading-relaxed" style={{ color: "var(--yb-text-muted)" }}>
                      {entry}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Blockchain Config */}
      {swarm?.blockchain_config && (
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: "rgba(0,82,255,0.08)", border: "1px solid rgba(0,82,255,0.2)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--yb-base)" }} />
            <span className="text-[10px] font-mono" style={{ color: "var(--yb-base)" }}>Base L2</span>
            <span className="text-[10px] font-mono" style={{ color: "var(--yb-text-muted)" }}>Chain ID: 8453</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: "rgba(76,162,255,0.08)", border: "1px solid rgba(76,162,255,0.2)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--yb-sui)" }} />
            <span className="text-[10px] font-mono" style={{ color: "var(--yb-sui)" }}>Sui</span>
            <span className="text-[10px] font-mono" style={{ color: "var(--yb-text-muted)" }}>Mainnet</span>
          </div>
        </div>
      )}

      {/* Gold Findings Feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold" style={{ color: "var(--yb-text-primary)" }}>Gold Findings</h2>
          <div className="flex gap-1">
            {["all", "sentinel", "scraper", "janitor"].map((f) => (
              <button
                key={f}
                data-testid={`filter-${f}`}
                onClick={() => setFindingFilter(f)}
                className="text-[10px] px-2.5 py-1 rounded-sm transition-all"
                style={{
                  background: findingFilter === f ? "rgba(255,255,255,0.08)" : "transparent",
                  color: findingFilter === f ? "var(--yb-text-primary)" : "var(--yb-text-muted)",
                  border: `1px solid ${findingFilter === f ? "rgba(255,255,255,0.15)" : "var(--yb-border)"}`,
                }}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          {filteredFindings.map((f) => {
            const meta = AGENT_META[f.agent_role] || {};
            const StatusIcon = STATUS_ICON[f.status] || AlertCircle;
            const statusColors = { PENDING_EXECUTION: "var(--yb-gold)", EXECUTED: "#22c55e", COLLECTED: "#60a5fa", REJECTED: "#ef4444" };
            const isPending = f.status === "PENDING_EXECUTION";

            return (
              <div
                key={f.id}
                data-testid={`finding-${f.id}`}
                className="rounded-sm p-4 flex items-start gap-4 transition-all animate-slide-up"
                style={{
                  background: "var(--yb-surface-1)",
                  border: isPending ? "1px solid rgba(255,184,0,0.2)" : "1px solid var(--yb-border)",
                }}
              >
                <div className="shrink-0 mt-0.5">
                  <StatusIcon size={16} style={{ color: statusColors[f.status] || "var(--yb-text-muted)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm" style={{ color: meta.color, background: `${meta.color}12` }}>
                      {f.agent_role}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: "var(--yb-text-muted)" }}>
                      {f.finding_type} / {f.network}
                    </span>
                    {f.priority === "high" && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm" style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
                        HIGH
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--yb-text-primary)" }}>{f.title}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--yb-text-secondary)" }}>{f.description}</p>
                  {f.execution_link && (
                    <a href={f.execution_link} target="_blank" rel="noopener noreferrer" className="text-[10px] mt-1 inline-block" style={{ color: meta.color }}>
                      View on-chain →
                    </a>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-black font-mono" style={{ color: "var(--yb-gold)" }}>
                    ${Math.round(f.estimated_profit)}
                  </div>
                  {isPending && (
                    <button
                      data-testid={`execute-${f.id}`}
                      onClick={() => handleExecute(f)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-sm mt-1 transition-all"
                      style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}
                    >
                      Execute
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredFindings.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: "var(--yb-text-muted)" }}>
              No findings match this filter.
            </p>
          )}
        </div>
      </div>

      {/* Vault Income Breakdown */}
      {vault && (
        <div className="rounded-sm p-5" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--yb-gold)" }}>
            Autonomous Vault
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--yb-text-muted)" }}>By Agent</p>
              {Object.entries(vault.by_agent || {}).map(([agent, amount]) => (
                <div key={agent} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid var(--yb-border)" }}>
                  <span className="text-xs font-mono" style={{ color: AGENT_META[agent]?.color || "var(--yb-text-secondary)" }}>
                    {agent}
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: "var(--yb-text-primary)" }}>
                    ${Math.round(amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--yb-text-muted)" }}>By Network</p>
              {Object.entries(vault.by_network || {}).map(([net, amount]) => (
                <div key={net} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid var(--yb-border)" }}>
                  <span className="text-xs font-mono" style={{ color: net === "base" ? "var(--yb-base)" : net === "sui" ? "var(--yb-sui)" : "var(--yb-text-secondary)" }}>
                    {net}
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: "var(--yb-text-primary)" }}>
                    ${Math.round(amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
