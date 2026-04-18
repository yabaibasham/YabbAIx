import { useState, useEffect, useCallback } from "react";
import {
  getTreasuryStatus, startTreasury, stopTreasury, distributeNow,
  resetCircuitBreaker, getTreasuryHistory, getWatchdogStatus, triggerWatchdog
} from "@/api/entities";
import {
  Vault, Play, Square, Banknote, ShieldAlert, ShieldCheck,
  RefreshCw, ArrowDownToLine, AlertTriangle, Heart, Activity
} from "lucide-react";

export default function Treasury() {
  const [treasury, setTreasury] = useState(null);
  const [history, setHistory] = useState([]);
  const [watchdog, setWatchdog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  const load = useCallback(async () => {
    try {
      const [t, h, w] = await Promise.all([
        getTreasuryStatus(),
        getTreasuryHistory(),
        getWatchdogStatus(),
      ]);
      setTreasury(t);
      setHistory(Array.isArray(h) ? h : []);
      setWatchdog(w);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const iv = setInterval(load, 10000); return () => clearInterval(iv); }, [load]);

  const handleStart = async () => { await startTreasury(); load(); };
  const handleStop = async () => { await stopTreasury(); load(); };
  const handleDistribute = async () => { await distributeNow(); setTimeout(load, 2000); };
  const handleResetBreaker = async () => { await resetCircuitBreaker(); load(); };
  const handleWatchdog = async () => { await triggerWatchdog(); setTimeout(load, 1000); };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-5 h-5 border-2 border-white/10 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );

  const t = treasury || {};
  const tierLabel = t.initial_complete ? "Tier 2: 5% Passive Stream" : t.net_profit >= 100 ? "Tier 1: 30% Initial Payday" : "Tier 0: Compounding";
  const tierColor = t.initial_complete ? "#22c55e" : t.net_profit >= 100 ? "var(--yb-gold)" : "var(--yb-text-muted)";
  const compoundPct = t.initial_complete ? 95 : (t.net_profit >= 100 ? 70 : 100);

  return (
    <div data-testid="treasury-page" className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Banknote size={18} style={{ color: "var(--yb-gold)" }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--yb-gold)" }}>
              Sovereign Vault
            </span>
            {t.circuit_breaker && (
              <span data-testid="circuit-breaker-alert" className="text-[10px] font-mono px-2 py-0.5 rounded-sm animate-pulse" style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                CIRCUIT BREAKER
              </span>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm" style={{
              color: t.running ? "#22c55e" : "var(--yb-text-muted)",
              background: t.running ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${t.running ? "rgba(34,197,94,0.2)" : "var(--yb-border)"}`,
            }}>
              {t.running ? "ACTIVE" : "STANDBY"}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--yb-text-primary)" }}>
            Tiered Profit Distribution
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--yb-text-muted)" }}>
            30% initial payday / 5% passive stream / 95% compound working capital
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button data-testid="btn-distribute-now" onClick={handleDistribute}
            className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-2 rounded-sm transition-all"
            style={{ background: "rgba(255,184,0,0.1)", color: "var(--yb-gold)", border: "1px solid rgba(255,184,0,0.2)" }}>
            <ArrowDownToLine size={12} /> Distribute Now
          </button>
          {t.running ? (
            <button data-testid="btn-stop-treasury" onClick={handleStop}
              className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-2 rounded-sm"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              <Square size={12} /> Stop Treasury
            </button>
          ) : (
            <button data-testid="btn-start-treasury" onClick={handleStart}
              className="flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-sm"
              style={{ background: "var(--yb-gold)", color: "#000" }}>
              <Play size={12} /> Start Treasury
            </button>
          )}
        </div>
      </div>

      {/* Tier Status Banner */}
      <div className="rounded-sm p-5" style={{
        background: `linear-gradient(135deg, ${tierColor}08 0%, transparent 100%)`,
        border: `1px solid ${tierColor}30`,
      }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: tierColor }}>
              Current Distribution Tier
            </p>
            <p className="text-lg font-black" style={{ color: "var(--yb-text-primary)" }}>{tierLabel}</p>
            <p className="text-xs mt-1" style={{ color: "var(--yb-text-muted)" }}>
              {t.initial_complete
                ? "Taking 5% of net profit. 95% reinvested into Gold-Hunter fleet."
                : t.net_profit >= 100
                  ? "Net profit exceeds $100. Ready for 30% initial withdrawal."
                  : `Net profit: $${(t.net_profit || 0).toFixed(2)}. Need $100+ to trigger Tier 1.`
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black font-mono" style={{ color: "var(--yb-gold)" }}>
              ${Math.round(t.net_profit || 0).toLocaleString()}
            </div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--yb-text-muted)" }}>Net Profit</div>
          </div>
        </div>

        {/* Distribution bar */}
        <div className="mt-4 flex gap-1 h-3 rounded-sm overflow-hidden">
          {t.initial_complete ? (
            <>
              <div className="rounded-sm" style={{ width: "5%", background: "var(--yb-gold)" }} title="5% Withdrawal" />
              <div className="rounded-sm" style={{ width: "95%", background: "rgba(34,197,94,0.3)" }} title="95% Compounding" />
            </>
          ) : t.net_profit >= 100 ? (
            <>
              <div className="rounded-sm" style={{ width: "30%", background: "var(--yb-gold)" }} title="30% Initial Payday" />
              <div className="rounded-sm" style={{ width: "70%", background: "rgba(34,197,94,0.3)" }} title="70% Working Capital" />
            </>
          ) : (
            <div className="rounded-sm w-full" style={{ background: "rgba(34,197,94,0.3)" }} title="100% Compounding" />
          )}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-mono" style={{ color: "var(--yb-gold)" }}>
            {t.initial_complete ? "5% withdrawal" : t.net_profit >= 100 ? "30% withdrawal" : "0% — compounding"}
          </span>
          <span className="text-[10px] font-mono" style={{ color: "#22c55e" }}>
            {compoundPct}% reinvested
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { v: `$${Math.round(t.total_withdrawn || 0).toLocaleString()}`, l: "Total Withdrawn", c: "var(--yb-gold)" },
          { v: `$${Math.round(t.net_profit || 0).toLocaleString()}`, l: "Net Profit", c: "#22c55e" },
          { v: t.tier || 0, l: "Current Tier", c: "var(--yb-text-primary)" },
          { v: t.consecutive_failures || 0, l: "Failed Attempts", c: (t.consecutive_failures || 0) > 0 ? "#ef4444" : "var(--yb-text-primary)" },
          { v: t.destination_configured ? "SET" : "NOT SET", l: "Destination", c: t.destination_configured ? "#22c55e" : "#ef4444" },
        ].map((s) => (
          <div key={s.l} className="rounded-sm p-3" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <div className="text-lg font-black font-mono" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: "var(--yb-text-muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-sm w-fit" style={{ background: "rgba(255,255,255,0.03)" }}>
        {[["overview", "Treasury Logs"], ["history", "Withdrawal History"], ["watchdog", "Watchdog"], ["safety", "Safety"]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} data-testid={`treasury-tab-${id}`}
            className="text-xs px-4 py-2 rounded-sm font-medium transition-all"
            style={{ background: tab === id ? "rgba(255,255,255,0.1)" : "transparent", color: tab === id ? "#fff" : "var(--yb-text-muted)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Treasury Logs */}
      {tab === "overview" && (
        <div className="rounded-sm p-4" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--yb-gold)" }}>Distribution Log</p>
          <div className="space-y-0.5 max-h-64 overflow-y-auto">
            {(t.log_entries || []).map((entry, i) => (
              <p key={i} className="text-[11px] font-mono leading-relaxed" style={{
                color: entry.includes("ERROR") || entry.includes("FAILED") ? "#ef4444"
                  : entry.includes("OK") || entry.includes("COMPLETE") ? "#22c55e"
                    : entry.includes("TIER") ? "var(--yb-gold)"
                      : "var(--yb-text-muted)",
              }}>
                {entry}
              </p>
            ))}
            {(!t.log_entries || t.log_entries.length === 0) && (
              <p className="text-xs" style={{ color: "var(--yb-text-muted)" }}>No treasury activity yet. Start the treasury or trigger a manual distribution.</p>
            )}
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      {tab === "history" && (
        <div className="space-y-1.5">
          {history.length === 0 ? (
            <p className="text-center py-16 text-sm" style={{ color: "var(--yb-text-muted)" }}>
              No withdrawals yet. Net profit needs to exceed $100 to trigger Tier 1.
            </p>
          ) : (
            history.map((w, i) => (
              <div key={i} className="rounded-sm p-4 flex items-center gap-4" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
                <ArrowDownToLine size={16} style={{ color: "var(--yb-gold)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--yb-text-primary)" }}>{w.source}</p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--yb-text-muted)" }}>
                    {w.network} · TX: {w.tx_hash?.slice(0, 16)}... · {w.created_date?.slice(0, 19)}
                  </p>
                </div>
                <div className="text-lg font-black font-mono" style={{ color: "var(--yb-gold)" }}>
                  ${Math.round(w.amount).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Watchdog */}
      {tab === "watchdog" && watchdog && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={14} style={{ color: watchdog.issues_detected?.length > 0 ? "#ef4444" : "#22c55e" }} />
              <span className="text-xs font-bold" style={{ color: "var(--yb-text-primary)" }}>System Health Monitor</span>
            </div>
            <button data-testid="btn-watchdog-check" onClick={handleWatchdog}
              className="text-[10px] font-medium px-3 py-1.5 rounded-sm"
              style={{ background: "rgba(255,255,255,0.04)", color: "var(--yb-text-secondary)", border: "1px solid var(--yb-border)" }}>
              <RefreshCw size={10} className="inline mr-1" /> Run Check
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { v: watchdog.health_checks, l: "Health Checks", c: "var(--yb-text-primary)" },
              { v: watchdog.auto_restarts, l: "Auto-Restarts", c: watchdog.auto_restarts > 0 ? "#f59e0b" : "var(--yb-text-primary)" },
              { v: (watchdog.issues_detected || []).length, l: "Active Issues", c: (watchdog.issues_detected || []).length > 0 ? "#ef4444" : "#22c55e" },
            ].map((s) => (
              <div key={s.l} className="rounded-sm p-3" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
                <div className="text-lg font-black font-mono" style={{ color: s.c }}>{s.v}</div>
                <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: "var(--yb-text-muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {(watchdog.issues_detected || []).length > 0 && (
            <div className="rounded-sm p-4" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#ef4444" }}>Active Issues</p>
              {watchdog.issues_detected.map((issue, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
                  <AlertTriangle size={12} style={{ color: issue.severity === "critical" ? "#ef4444" : "#f59e0b" }} />
                  <span className="text-xs font-mono" style={{ color: "var(--yb-text-secondary)" }}>{issue.component}: {issue.error}</span>
                  <span className="text-[10px] ml-auto" style={{ color: issue.severity === "critical" ? "#ef4444" : "#f59e0b" }}>{issue.severity}</span>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-sm p-4" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--yb-text-muted)" }}>Watchdog Log</p>
            {(watchdog.log_entries || []).map((entry, i) => (
              <p key={i} className="text-[11px] font-mono leading-relaxed" style={{
                color: entry.includes("issues") ? "#f59e0b" : entry.includes("OK") ? "#22c55e" : "var(--yb-text-muted)",
              }}>{entry}</p>
            ))}
          </div>
        </div>
      )}

      {/* Safety Tab */}
      {tab === "safety" && (
        <div className="space-y-3">
          <div className="rounded-sm p-5" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--yb-text-muted)" }}>Safety Constraints</p>
            <div className="space-y-3">
              {[
                { label: "Gas Reserve (Base)", value: `${t.gas_reserve_eth || 0.01} ETH`, status: "active", desc: "Working wallet never drops below this on Base L2" },
                { label: "Gas Reserve (Sui)", value: `${t.gas_reserve_sui || 5} SUI`, status: "active", desc: "Working wallet never drops below this on Sui" },
                { label: "Circuit Breaker", value: t.circuit_breaker ? "TRIGGERED" : "Armed", status: t.circuit_breaker ? "danger" : "active", desc: "Pauses after 2 consecutive withdrawal failures" },
                { label: "Daily Max Spend", value: "$50 USD", status: "active", desc: "Operating costs capped per day" },
                { label: "Withdrawal Destination", value: t.destination_configured ? t.destination_preview : "NOT CONFIGURED", status: t.destination_configured ? "active" : "warning", desc: "Set WITHDRAWAL_DESTINATION in .env" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--yb-border)" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--yb-text-primary)" }}>{s.label}</p>
                    <p className="text-[10px]" style={{ color: "var(--yb-text-muted)" }}>{s.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold" style={{ color: s.status === "danger" ? "#ef4444" : s.status === "warning" ? "#f59e0b" : "#22c55e" }}>
                      {s.value}
                    </span>
                    {s.status === "active" && <ShieldCheck size={14} style={{ color: "#22c55e" }} />}
                    {s.status === "danger" && <ShieldAlert size={14} style={{ color: "#ef4444" }} />}
                    {s.status === "warning" && <AlertTriangle size={14} style={{ color: "#f59e0b" }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {t.circuit_breaker && (
            <button data-testid="btn-reset-breaker" onClick={handleResetBreaker}
              className="w-full text-sm font-bold py-3 rounded-sm transition-all"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              Reset Circuit Breaker
            </button>
          )}

          <div className="rounded-sm p-5" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--yb-text-muted)" }}>Sovereign Rules (RULES.md)</p>
            <div className="space-y-2 text-xs font-mono leading-relaxed" style={{ color: "var(--yb-text-secondary)" }}>
              <p>1. If Net_Profit &gt; $100 AUD → withdraw 30% to destination (Tier 1)</p>
              <p>2. After Tier 1 fulfilled → switch to 5% recurring (Tier 2)</p>
              <p>3. Retain 95% as working capital for gas + scaling (Tier 3)</p>
              <p>4. Gas reserve: 0.01 ETH (Base) / 5 SUI minimum</p>
              <p>5. Circuit breaker: 2 failed withdrawals = pause + emergency alert</p>
              <p>6. Watchdog: 60s health checks, auto-restart on transient errors</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
