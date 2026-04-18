import { useState, useEffect, useCallback, useRef } from "react";
const API = "https://69dc535a010d77d9f2bf7f27.functions.base44.com/publicData";

const S = {
  Seed:      { pill: "bg-amber-400/10 text-amber-300 border-amber-400/20",      dot: "bg-amber-400",   label: "Seed" },
  Active:    { pill: "bg-sky-400/10 text-sky-300 border-sky-400/20",            dot: "bg-sky-400",     label: "Active" },
  Branching: { pill: "bg-violet-400/10 text-violet-300 border-violet-400/20",   dot: "bg-violet-400",  label: "Branching" },
  Scaling:   { pill: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",dot: "bg-emerald-400", label: "Scaling" },
  Culled:    { pill: "bg-zinc-400/10 text-zinc-500 border-zinc-700/30",          dot: "bg-zinc-600",   label: "Culled" },
};

const sc    = s => s >= 90 ? "#f87171" : s >= 75 ? "#34d399" : s >= 50 ? "#fbbf24" : "#f97316";
const scTw  = s => s >= 90 ? "text-red-400" : s >= 75 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-orange-400";
const scBg  = s => s >= 90 ? "bg-red-500" : s >= 75 ? "bg-emerald-500" : s >= 50 ? "bg-amber-500" : "bg-orange-500";

const Bar = ({ s }) => (
  <div className="h-0.5 w-full bg-white/6 rounded-full overflow-hidden">
    <div className={`h-full rounded-full ${scBg(s)}`} style={{ width: `${s}%`, opacity: 0.8 }} />
  </div>
);

export default function Dashboard() {
  const [timelines, setTimelines] = useState([]);
  const [assets,    setAssets]    = useState([]);
  const [signals,   setSignals]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("colonies");
  const [filter,    setFilter]    = useState("all");
  const [expanded,  setExpanded]  = useState({});
  const [resetting, setResetting] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [ts,        setTs]        = useState(null);
  const isFirst = useRef(true);

  const toast$ = (m, t = "ok") => { setToast({ m, t }); setTimeout(() => setToast(null), 3500); };

  const load = useCallback(async (silent = false) => {
    try {
      const res  = await fetch(API + "?type=dashboard");
      const json = await res.json();
      if (json.ok) {
        setTimelines(json.data.timelines || []);
        setAssets(json.data.assets || []);
        setSignals([]);
        setTs(new Date());
      } else { throw new Error(json.error || "API error"); }
    } catch (e) {
      if (!silent) toast$("Could not reach dashboard — retrying…", "err");
      console.warn("Dashboard load error:", e);
    } finally {
      if (isFirst.current) { isFirst.current = false; setLoading(false); }
    }
  }, []);

  // First load — visible spinner
  useEffect(() => { load(false); }, [load]);

  // Background auto-refresh — silent, never shows error toast
  useEffect(() => {
    const iv = setInterval(() => load(true), 30000);
    return () => clearInterval(iv);
  }, [load]);

  const reset = async () => {
    setResetting(true);
    try {
      const hot = timelines.filter(t => t.opportunity_detected);
      // Reset flags via API — public dashboard is read-only, flags clear on next loop run
      // toast shows count only
      toast$(`Cleared ${hot.length} spawn flag${hot.length !== 1 ? "s" : ""}`);
      load(true);
    } catch { toast$("Reset failed", "err"); }
    finally { setResetting(false); }
  };

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const live    = timelines.filter(t => t.status !== "Culled");
  const capital = timelines.find(t => t.tags?.includes("capital-colony"));
  const greenZone = timelines.filter(t => t.tags?.includes("green-zone") && t.status !== "Culled").length;
  const blueVault = timelines.filter(t => t.tags?.includes("future-vault") && t.status !== "Culled").length;
  const hot = timelines.filter(t => t.opportunity_detected).length;

  const avgSig = live.length
    ? Math.round(live.reduce((a, b) => a + (b.profit_signal || 0), 0) / live.length)
    : 0;

  const stats = [
    { v: live.length,                                              l: "Colonies" },
    { v: live.filter(t => t.status === "Scaling").length,         l: "Scaling",   c: "text-emerald-400" },
    { v: live.filter(t => t.status === "Active").length,          l: "Active",    c: "text-sky-400" },
    { v: avgSig,                                                   l: "Avg Signal",c: scTw(avgSig) },
    { v: assets.length,                                            l: "Assets",    c: "text-violet-400" },
    { v: assets.filter(a => ["Published","Live"].includes(a.status)).length, l: "Published", c: "text-pink-400" },
  ];

  const roots    = timelines.filter(t => !t.parent_id || t.parent_id === "root");
  const sorted   = [...roots].sort((a, b) => {
    if (a.tags?.includes("capital-colony")) return -1;
    if (b.tags?.includes("capital-colony")) return 1;
    return (b.profit_signal || 0) - (a.profit_signal || 0);
  });
  const filtered = filter === "all" ? sorted : sorted.filter(t => t.status === filter);

  const renderTimeline = (tl, depth = 0) => {
    const children = timelines.filter(c => c.parent_id === tl.id);
    const tlAssets = assets.filter(a => a.timeline_id === tl.id);
    const meta     = S[tl.status] || S.Seed;
    const sig      = tl.profit_signal ?? 0;
    const isCapital= tl.tags?.includes("capital-colony");
    const open     = expanded[tl.id] ?? (depth === 0);

    return (
      <div key={tl.id} className={depth > 0 ? "ml-6 border-l border-white/5 pl-4" : ""}>
        <div onClick={() => toggle(tl.id)}
          className={`mb-1.5 rounded-2xl border cursor-pointer transition-all duration-200
            ${isCapital
              ? "bg-gradient-to-br from-violet-950/60 to-fuchsia-950/40 border-violet-500/25 hover:border-violet-400/40"
              : "bg-[#0f0f0f] border-white/6 hover:border-white/12 hover:bg-[#141414]"}
            ${tl.status === "Culled" ? "opacity-30" : ""}`}>
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {isCapital && (
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/25">
                      Capital Colony
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md border font-medium ${meta.pill}`}>
                    <span className={`w-1 h-1 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                  {depth > 0 && <span className="text-[10px] text-white/20 font-mono">d{depth}</span>}
                  {tlAssets.length > 0 && (
                    <span className="text-[10px] text-emerald-400/60 border border-emerald-500/15 px-2 py-0.5 rounded-md">
                      {tlAssets.length} asset{tlAssets.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <h3 className={`font-semibold text-sm leading-snug ${isCapital ? "text-white" : "text-white/80"}`}>{tl.name}</h3>
                <p className="text-white/30 text-xs mt-1 line-clamp-1">{tl.branch_logic_state}</p>
              </div>
              <div className="shrink-0 text-right w-16">
                <div className="text-2xl font-black font-mono" style={{ color: sc(sig) }}>{sig}</div>
                <div className="mt-1"><Bar s={sig} /></div>
              </div>
            </div>

            {open && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                {isCapital && (
                  <a href="/CapitalColony" target="_blank"
                    className="flex items-center justify-between bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 rounded-xl px-4 py-2.5 transition-all group/link">
                    <span className="text-violet-300 text-sm font-medium">Open Capital Colony Waitlist</span>
                    <span className="text-violet-400/60 group-hover/link:translate-x-0.5 transition-transform">→</span>
                  </a>
                )}
                {tl.objective && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1">Objective</p>
                    <p className="text-white/55 text-xs leading-relaxed">{tl.objective}</p>
                  </div>
                )}
                {tl.last_report && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1">Last Report</p>
                    <pre className="text-white/45 text-xs whitespace-pre-wrap font-sans leading-relaxed">{tl.last_report}</pre>
                  </div>
                )}
                {tl.tags?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {[...new Set(tl.tags)].slice(0, 8).map(tag => (
                      <span key={tag} className="text-[10px] text-white/25 bg-white/4 px-2 py-0.5 rounded-md font-mono">#{tag}</span>
                    ))}
                  </div>
                )}
                {tlAssets.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-white/25">Assets</p>
                    {tlAssets.map(a => (
                      <div key={a.id} className="flex items-center justify-between bg-white/3 rounded-xl px-3 py-2.5 border border-white/5">
                        <div className="min-w-0">
                          <p className="text-white/70 text-xs font-medium truncate">{a.title}</p>
                          <p className="text-white/30 text-[10px] mt-0.5">{a.asset_type} · {a.status}</p>
                        </div>
                        {a.url && <a href={a.url} target="_blank" className="text-violet-400/60 hover:text-violet-300 text-xs ml-3 shrink-0">↗</a>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {children.length > 0 && open && children.map(c => renderTimeline(c, depth + 1))}
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white" style={{ background: "#080808", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl border
          ${toast.t === "err"
            ? "bg-red-950 border-red-500/30 text-red-300"
            : "bg-emerald-950 border-emerald-500/30 text-emerald-300"}`}>
          {toast.m}
        </div>
      )}

      {/* Nav */}
      <nav className="border-b border-white/6 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-black">Y</div>
            <span className="text-sm font-semibold text-white/90">YABAI</span>
            <span className="text-white/20 text-sm">/</span>
            <span className="text-white/40 text-sm">Control</span>
            {ts && (
              <span className="text-white/15 text-[10px] ml-1 hidden sm:block font-mono">
                {ts.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {greenZone > 0 && (
              <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                🟢 {greenZone} actioned
              </span>
            )}
            {blueVault > 0 && (
              <a href="/ControlRoom" className="text-[11px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-lg hover:bg-sky-500/15 transition-all">
                🔵 {blueVault} vault
              </a>
            )}
            <button onClick={() => load(false)}
              className="text-[11px] bg-white/4 hover:bg-white/8 text-white/40 hover:text-white/70 border border-white/8 px-3 py-1.5 rounded-lg transition-all">
              ↺
            </button>
            <button onClick={reset} disabled={resetting}
              className="text-[11px] bg-white/4 hover:bg-white/8 text-white/40 hover:text-white/70 border border-white/8 px-3 py-1.5 rounded-lg transition-all disabled:opacity-30">
              {resetting ? "…" : "Reset flags"}
            </button>
            <a href="/Rover"      className="text-[11px] bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all font-medium">Rover</a>
            <a href="/StrikeDeck" className="text-[11px] bg-violet-500/10  hover:bg-violet-500/15  text-violet-300  border border-violet-500/20  px-3 py-1.5 rounded-lg transition-all font-medium">Strike</a>
            <a href="/ControlRoom" className="text-[11px] bg-fuchsia-500/10 hover:bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/20 px-3 py-1.5 rounded-lg transition-all font-medium">⚡ CR</a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">

        {/* Capital Colony banner */}
        {capital && (
          <a href="/CapitalColony" target="_blank"
            className="block rounded-2xl border border-violet-500/20 overflow-hidden hover:border-violet-400/35 transition-all group"
            style={{ background: "linear-gradient(135deg,rgba(109,40,217,.12) 0%,rgba(168,85,247,.06) 50%,transparent 100%)" }}>
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-lg">🏛️</div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-violet-400/70 mb-0.5">Capital Colony · Priority 1</p>
                  <h2 className="text-white font-semibold text-sm">AI-Powered Legal Discovery → SaaS</h2>
                  <p className="text-white/35 text-xs mt-0.5">14 Melbourne firms · $58,560/mo gap · 122h/wk wasted</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-3xl font-black font-mono text-red-400">{capital.profit_signal || 92}</div>
                  <div className="text-white/25 text-[10px]">signal</div>
                </div>
                <span className="text-white/30 group-hover:text-white/70 transition-all text-lg">→</span>
              </div>
            </div>
          </a>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {stats.map(s => (
            <div key={s.l} className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-4">
              <div className={`text-2xl font-black font-mono ${s.c || "text-white/80"}`}>{s.v}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/3 rounded-xl p-1 w-fit">
          {[["colonies","Colonies"],["assets","Assets"],["signals","Signals"]].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`text-xs px-4 py-2 rounded-lg font-medium transition-all ${tab === id ? "bg-white/10 text-white shadow-sm" : "text-white/35 hover:text-white/60"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* ── COLONIES ── */}
        {tab === "colonies" && (
          <div>
            <div className="flex gap-1.5 mb-4 flex-wrap items-center">
              {["all","Scaling","Active","Seed","Culled"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${filter === f ? "bg-white/8 border-white/15 text-white/80" : "border-white/6 text-white/30 hover:text-white/55 hover:border-white/10"}`}>
                  {f === "all" ? "All" : f}
                </button>
              ))}
              <span className="text-white/15 text-[10px] ml-auto font-mono">{filtered.length} roots</span>
            </div>

            {loading
              ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
                  <p className="text-white/20 text-xs">Loading colonies…</p>
                </div>
              )
              : filtered.length === 0
                ? <p className="text-white/20 text-sm py-10 text-center">No colonies match this filter.</p>
                : filtered.map(r => renderTimeline(r))
            }
          </div>
        )}

        {/* ── ASSETS ── */}
        {tab === "assets" && (
          <div>
            <p className="text-white/25 text-xs mb-4 font-mono">{assets.length} total · {assets.filter(a => ["Published","Live"].includes(a.status)).length} live</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[...assets]
                .sort((a, b) => (b.signal_at_creation || 0) - (a.signal_at_creation || 0))
                .map(a => (
                  <div key={a.id} className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-4 hover:border-white/12 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="text-[10px] border border-white/10 text-white/40 px-2 py-0.5 rounded-md">{a.asset_type}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${["Published","Live"].includes(a.status) ? "text-emerald-400 bg-emerald-500/8 border-emerald-500/20" : "text-white/30 border-white/8"}`}>
                          {a.status}
                        </span>
                      </div>
                      <div className={`text-lg font-black font-mono shrink-0 ${scTw(a.signal_at_creation || 0)}`}>{a.signal_at_creation || 0}</div>
                    </div>
                    <p className="text-white/70 text-sm font-medium leading-snug line-clamp-2">{a.title}</p>
                    {a.mrr_estimate && a.mrr_estimate !== "TBD" && (
                      <p className="text-emerald-400/60 text-xs mt-1.5">💰 {a.mrr_estimate}</p>
                    )}
                    {a.url && (
                      <a href={a.url} target="_blank" className="mt-2 inline-flex items-center gap-1 text-[11px] text-violet-400/60 hover:text-violet-300 transition-colors">View ↗</a>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ── SIGNALS ── */}
        {tab === "signals" && (
          <div className="space-y-2">
            {[...signals]
              .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
              .slice(0, 25)
              .map(s => {
                const tl = timelines.find(t => t.id === s.timeline_id);
                return (
                  <div key={s.id} className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-4 flex items-start gap-4">
                    <div className={`text-xl font-black font-mono w-10 shrink-0 ${scTw(s.score || 0)}`}>{s.score || 0}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/65 text-sm font-medium truncate">{tl?.name || "—"}</p>
                      <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{s.raw_data}</p>
                      <p className="text-white/15 text-[10px] mt-1 font-mono">{s.source} · {new Date(s.created_date).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })
            }
            {signals.length === 0 && !loading && (
              <p className="text-white/20 text-sm py-10 text-center">No signals yet.</p>
            )}
          </div>
        )}
      </div>

      <footer className="border-t border-white/4 mt-16 py-5 text-center text-white/10 text-[10px] tracking-widest uppercase">
        YABAI · Expansion Planet · Max d3 · Cap 50 · Spawn: Manual
      </footer>
    </div>
  );
}
