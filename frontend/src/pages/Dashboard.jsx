import { useState, useEffect, useCallback } from "react";
import { getDashboardData } from "@/api/entities";
import { NavLink } from "react-router-dom";
import { TrendingUp, Layers, Zap, ArrowUpRight, ChevronDown } from "lucide-react";

const STATUS_STYLES = {
  Seed: { bg: "rgba(251,191,36,0.1)", text: "#fbbf24", dot: "#fbbf24" },
  Active: { bg: "rgba(96,165,250,0.1)", text: "#60a5fa", dot: "#60a5fa" },
  Branching: { bg: "rgba(167,139,250,0.1)", text: "#a78bfa", dot: "#a78bfa" },
  Scaling: { bg: "rgba(34,197,94,0.1)", text: "#22c55e", dot: "#22c55e" },
  Culled: { bg: "rgba(82,82,91,0.1)", text: "#52525b", dot: "#52525b" },
};

const sigColor = (s) =>
  s >= 90 ? "#ef4444" : s >= 75 ? "#22c55e" : s >= 50 ? "#fbbf24" : "#f97316";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [tab, setTab] = useState("colonies");

  const load = useCallback(async () => {
    try {
      const d = await getDashboardData();
      setData(d);
    } catch (e) {
      console.warn("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const iv = setInterval(() => load(), 30000); return () => clearInterval(iv); }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-5 h-5 border-2 border-white/10 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );

  const timelines = data?.timelines || [];
  const assets = data?.assets || [];
  const findings = data?.gold_findings || [];
  const vault = data?.vault_summary || {};
  const live = timelines.filter((t) => t.status !== "Culled");
  const avgSig = live.length ? Math.round(live.reduce((a, b) => a + (b.profit_signal || 0), 0) / live.length) : 0;

  const stats = [
    { v: live.length, l: "Colonies", c: "var(--yb-text-primary)" },
    { v: live.filter((t) => t.status === "Scaling").length, l: "Scaling", c: "#22c55e" },
    { v: findings.filter((f) => f.status === "PENDING_EXECUTION").length, l: "Gold Pending", c: "var(--yb-gold)" },
    { v: avgSig, l: "Avg Signal", c: sigColor(avgSig) },
    { v: `$${Math.round(vault.total_income || 0).toLocaleString()}`, l: "Vault Income", c: "#22c55e" },
    { v: assets.length, l: "Assets", c: "#a78bfa" },
  ];

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div data-testid="dashboard-page" className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Gold-Hunter Banner */}
      <NavLink
        to="/gold-hunter"
        data-testid="gold-hunter-banner"
        className="block rounded-sm border overflow-hidden transition-all hover:border-amber-400/40"
        style={{
          background: "linear-gradient(135deg, rgba(255,184,0,0.08) 0%, rgba(255,184,0,0.02) 50%, transparent 100%)",
          borderColor: "rgba(255,184,0,0.2)",
        }}
      >
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-sm flex items-center justify-center text-lg" style={{ background: "rgba(255,184,0,0.15)", border: "1px solid rgba(255,184,0,0.3)" }}>
              <Zap size={20} color="var(--yb-gold)" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: "var(--yb-gold)" }}>
                Gold-Hunter Swarm {data?.swarm_running ? "ACTIVE" : "STANDBY"}
              </p>
              <h2 className="font-bold text-sm" style={{ color: "var(--yb-text-primary)" }}>
                24/7 Autonomous Income Generation
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--yb-text-muted)" }}>
                {findings.length} findings | ${Math.round(vault.net || 0).toLocaleString()} net income | 3 agents deployed
              </p>
            </div>
          </div>
          <ArrowUpRight size={20} style={{ color: "var(--yb-gold)" }} />
        </div>
      </NavLink>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {stats.map((s) => (
          <div key={s.l} className="rounded-sm p-4" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <div className="text-2xl font-black font-mono" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "var(--yb-text-muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-sm w-fit" style={{ background: "rgba(255,255,255,0.03)" }}>
        {[["colonies", "Colonies"], ["assets", "Assets"], ["gold", "Gold Findings"]].map(([id, l]) => (
          <button
            key={id}
            data-testid={`tab-${id}`}
            onClick={() => setTab(id)}
            className="text-xs px-4 py-2 rounded-sm font-medium transition-all"
            style={{
              background: tab === id ? "rgba(255,255,255,0.1)" : "transparent",
              color: tab === id ? "var(--yb-text-primary)" : "var(--yb-text-muted)",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Colonies Tab */}
      {tab === "colonies" && (
        <div className="space-y-1.5">
          {timelines
            .filter((t) => !t.parent_id)
            .sort((a, b) => (b.profit_signal || 0) - (a.profit_signal || 0))
            .map((tl) => {
              const meta = STATUS_STYLES[tl.status] || STATUS_STYLES.Seed;
              const sig = tl.profit_signal || 0;
              const isGold = tl.tags?.includes("gold-hunter");
              const open = expanded[tl.id];
              return (
                <div
                  key={tl.id}
                  data-testid={`timeline-${tl.id}`}
                  className="rounded-sm border cursor-pointer transition-all"
                  style={{
                    background: isGold ? "rgba(255,184,0,0.03)" : "var(--yb-surface-1)",
                    borderColor: isGold ? "rgba(255,184,0,0.15)" : "var(--yb-border)",
                  }}
                  onClick={() => toggle(tl.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {isGold && (
                            <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm" style={{ background: "rgba(255,184,0,0.15)", color: "var(--yb-gold)", border: "1px solid rgba(255,184,0,0.3)" }}>
                              Gold Hunter
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-sm border font-medium" style={{ background: meta.bg, color: meta.text, borderColor: meta.bg }}>
                            <span className="w-1 h-1 rounded-full" style={{ background: meta.dot }} />
                            {tl.status}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm" style={{ color: "var(--yb-text-primary)" }}>{tl.name}</h3>
                        <p className="text-xs mt-1 line-clamp-1" style={{ color: "var(--yb-text-muted)" }}>{tl.branch_logic_state}</p>
                      </div>
                      <div className="shrink-0 text-right w-16">
                        <div className="text-2xl font-black font-mono" style={{ color: sigColor(sig) }}>{sig}</div>
                        <div className="h-0.5 w-full rounded-full overflow-hidden mt-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full" style={{ width: `${sig}%`, background: sigColor(sig), opacity: 0.8 }} />
                        </div>
                      </div>
                    </div>
                    {open && (
                      <div className="mt-4 pt-4 space-y-3" style={{ borderTop: "1px solid var(--yb-border)" }}>
                        {tl.objective && (
                          <div>
                            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--yb-text-muted)" }}>Objective</p>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--yb-text-secondary)" }}>{tl.objective}</p>
                          </div>
                        )}
                        {tl.last_report && (
                          <div>
                            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--yb-text-muted)" }}>Last Report</p>
                            <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed" style={{ color: "var(--yb-text-secondary)" }}>{tl.last_report}</pre>
                          </div>
                        )}
                        {tl.tags?.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {tl.tags.map((tag) => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-sm font-mono" style={{ color: "var(--yb-text-muted)", background: "rgba(255,255,255,0.04)" }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Assets Tab */}
      {tab === "assets" && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => (
            <div key={a.id} className="rounded-sm p-4 transition-all hover:border-white/20" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] border px-2 py-0.5 rounded-sm" style={{ color: "var(--yb-text-muted)", borderColor: "var(--yb-border)" }}>{a.asset_type}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-sm font-medium" style={{ color: ["Published", "Live"].includes(a.status) ? "#22c55e" : "var(--yb-text-muted)", background: ["Published", "Live"].includes(a.status) ? "rgba(34,197,94,0.08)" : "transparent" }}>
                  {a.status}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: "var(--yb-text-primary)" }}>{a.title}</p>
              {a.mrr_estimate && <p className="text-xs mt-1.5" style={{ color: "#22c55e" }}>{a.mrr_estimate}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Gold Findings Tab */}
      {tab === "gold" && (
        <div className="space-y-2">
          {findings.map((f) => {
            const roleColors = { sentinel: "var(--yb-sentinel)", scraper: "var(--yb-scraper)", janitor: "var(--yb-janitor)" };
            const statusColors = { PENDING_EXECUTION: "var(--yb-gold)", EXECUTED: "#22c55e", COLLECTED: "#60a5fa", REJECTED: "#ef4444" };
            return (
              <div
                key={f.id}
                data-testid={`gold-finding-${f.id}`}
                className="rounded-sm p-4 flex items-start gap-4 transition-all"
                style={{
                  background: "var(--yb-surface-1)",
                  border: f.status === "PENDING_EXECUTION" ? "1px solid rgba(255,184,0,0.2)" : "1px solid var(--yb-border)",
                }}
              >
                <div className="shrink-0 text-right w-16">
                  <div className="text-lg font-black font-mono" style={{ color: roleColors[f.agent_role] || "var(--yb-gold)" }}>
                    ${Math.round(f.estimated_profit)}
                  </div>
                  <div className="text-[10px] font-mono" style={{ color: "var(--yb-text-muted)" }}>{f.network}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-mono" style={{ color: roleColors[f.agent_role], background: `${roleColors[f.agent_role]}15` }}>
                      {f.agent_role}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-mono" style={{ color: statusColors[f.status] || "var(--yb-text-muted)" }}>
                      {f.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--yb-text-primary)" }}>{f.title}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--yb-text-secondary)" }}>{f.description}</p>
                </div>
              </div>
            );
          })}
          {findings.length === 0 && (
            <p className="text-center py-16 text-sm" style={{ color: "var(--yb-text-muted)" }}>
              No gold findings yet. Start the swarm to begin scouting.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
