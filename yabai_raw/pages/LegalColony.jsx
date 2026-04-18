import { useState } from "react";
import { DigitalAsset } from "@/api/entities";

const AUDITS = [
  { firm:"Ringwood Legal", suburb:"Ringwood", type:"Family Law", gap:"Manually reviewing 40+ page parenting agreements instead of AI-flagging conflict clauses in seconds", fix:"AI contract review layer that highlights dispute triggers and precedent mismatches instantly", hours:6, cost:"$2,880", score:88, subject:"Your family law team is spending 6hrs/week on work AI can do in 4 minutes" },
  { firm:"Maroondah Lawyers", suburb:"Ringwood", type:"Conveyancing", gap:"Staff manually cross-checking title searches against council overlays — missing automated risk flags", fix:"AI overlay that auto-matches title data to planning restrictions and flags anomalies before settlement", hours:8, cost:"$3,840", score:91, subject:"8 hrs/week on title searches that AI resolves in under 60 seconds" },
  { firm:"Eastfield Law", suburb:"Croydon", type:"Commercial Litigation", gap:"Junior lawyers spending 12+ hours per case doing discovery keyword searches across document dumps", fix:"AI-powered discovery that ingests 10,000 documents and surfaces the 40 relevant ones in minutes", hours:12, cost:"$5,760", score:94, subject:"Your $5,760/mo discovery bottleneck — fixed with one tool" },
  { firm:"Healesville Legal Group", suburb:"Healesville", type:"Wills & Estates", gap:"Estate paralegals manually comparing testamentary documents across multiple versions", fix:"Document diff AI that flags clause conflicts between will versions automatically", hours:5, cost:"$2,400", score:79, subject:"A 5-minute audit reveals $2,400/mo in paralegal bottlenecks" },
  { firm:"Warrandyte Law", suburb:"Warrandyte", type:"Planning & Environment", gap:"Lawyers manually interpreting 200-page planning scheme amendments for each client matter", fix:"AI that ingests planning updates and generates client-ready impact summaries in 2 minutes", hours:9, cost:"$4,320", score:86, subject:"Planning scheme amendments are costing you 9 hrs every week" },
  { firm:"Doncaster Legal Partners", suburb:"Doncaster", type:"Employment Law", gap:"HR advisory matters require manual review of Fair Work Act sections — no semantic search", fix:"Semantic legal search that maps client scenarios to Fair Work provisions and recent decisions", hours:7, cost:"$3,360", score:87, subject:"Employment law research that takes 7hrs — AI does it in 8 minutes" },
  { firm:"Blackburn Law Group", suburb:"Blackburn", type:"Corporate & M&A", gap:"Due diligence document review is 100% manual — no AI extraction of risk clauses", fix:"M&A due diligence AI that extracts and red-flags 500+ documents overnight", hours:15, cost:"$7,200", score:95, subject:"$7,200/mo due diligence gap — your competitors already fixed this" },
  { firm:"Box Hill Community Legal", suburb:"Box Hill", type:"Immigration", gap:"Caseworkers manually searching VCAT and AAT decisions for relevant precedents — 4+ hours per matter", fix:"AI precedent finder trained on VCAT/AAT decisions, returning ranked results in 30 seconds", hours:10, cost:"$4,800", score:89, subject:"10 hrs/week on precedent research — what if it took 30 seconds?" },
  { firm:"Camberwell Legal Centre", suburb:"Camberwell", type:"Personal Injury", gap:"Medical report analysis for PI claims done manually — no structured data extraction", fix:"Medical document AI that extracts injury classifications and treatment timelines automatically", hours:8, cost:"$3,840", score:83, subject:"Your PI team manually reads every medical report. There's a better way." },
  { firm:"Kew Law Chambers", suburb:"Kew", type:"Tax & Revenue", gap:"ATO private ruling research done manually — no intelligent mapping to relevant decisions", fix:"AI tax ruling navigator that maps client scenarios to ATO decisions semantically", hours:6, cost:"$2,880", score:82, subject:"6hrs/week on ATO ruling research that AI can do in under 3 minutes" },
  { firm:"Richmond Legal Group", suburb:"Richmond", type:"IP & Tech", gap:"IP attorneys manually monitoring trademark and patent databases for infringement risks", fix:"Automated IP watch service with AI similarity scoring across trademark classes", hours:5, cost:"$2,400", score:80, subject:"Your clients' IP is at risk — and your team is finding out 3 months late" },
  { firm:"Fitzroy Street Legal", suburb:"St Kilda", type:"Criminal Defence", gap:"Solicitors manually reviewing police brief materials — no AI-assisted inconsistency detection", fix:"Brief analysis AI that cross-references witness statements for inconsistencies", hours:11, cost:"$5,280", score:90, subject:"AI found 3 inconsistencies in a 200-page brief in 90 seconds. Interested?" },
  { firm:"Collins Street Barristers", suburb:"Melbourne CBD", type:"Commercial Arbitration", gap:"Barristers manually extracting findings from arbitration awards for submissions — no semantic synthesis", fix:"Arbitration intelligence layer that synthesizes award outcomes and extracts winning argument patterns", hours:13, cost:"$6,240", score:93, subject:"13hrs/week building submissions that AI can draft in 15 minutes" },
  { firm:"Springvale Community Law", suburb:"Springvale", type:"Tenancy & Consumer", gap:"VCAT hearing preparation entirely manual — no AI pre-screening of tribunal precedents", fix:"VCAT outcome predictor that analyzes matter facts against 5 years of decisions", hours:7, cost:"$3,360", score:85, subject:"What if you knew the VCAT outcome before filing?" },
];

const sc = s => s >= 90 ? "text-red-400" : s >= 80 ? "text-orange-400" : "text-amber-400";
const scBg = s => s >= 90 ? "border-red-500/20" : s >= 80 ? "border-orange-500/20" : "border-amber-500/20";

export default function LegalColony() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("waitlist");
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState(null);

  const copy = (text, key) => { navigator.clipboard?.writeText(text); setCopied(key); setTimeout(()=>setCopied(null),2000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try { await DigitalAsset.create({ timeline_id:"69df1d35fc9a8b8d89ac8715", asset_type:"Email Capture", title:`Lead: ${email}`, content:email, status:"Live", signal_at_creation:92, niche:"legal-tech", mrr_estimate:"$50,000–$200,000/mo", email_captures:1 }); }
    catch {}
    setSubmitted(true); setLoading(false);
  };

  const filtered = filter === "all" ? AUDITS : filter === "critical" ? AUDITS.filter(a=>a.score>=90) : AUDITS.filter(a=>a.suburb.includes(filter));
  const totalHours = AUDITS.reduce((s,a)=>s+a.hours,0);

  return (
    <div className="min-h-screen text-white" style={{ background:"#080808", fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-black">Y</div>
            <span className="text-sm font-semibold text-white/80">YABAI <span className="text-white/25">/</span> Legal Colony</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/CapitalColony" className="text-[11px] bg-white/4 text-white/40 px-3 py-1.5 rounded-lg hover:bg-white/8 transition-all">Waitlist ↗</a>
            <a href="/StrikeDeck" className="text-[11px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1.5 rounded-lg hover:bg-violet-500/15 transition-all">Strike Deck</a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6">

        {/* Hero */}
        <div className="pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 text-[11px] text-white/35 border border-white/8 px-3 py-1.5 rounded-full mb-7">
            <span className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
            Signal 92/100 · Capital Colony · Melbourne Legal Tech
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            14 Melbourne law firms.<br/>
            <span style={{background:"linear-gradient(135deg,#a78bfa,#f472b6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              $58,560/mo wasted.
            </span>
          </h1>
          <p className="text-white/40 text-base max-w-xl mx-auto">Every firm audited. Every gap found. The same AI tools your clients use can't find any of them.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { v:`${totalHours}h`, l:"Hours lost per week", c:"text-orange-400" },
            { v:"$58,560", l:"Monthly cost identified", c:"text-red-400" },
            { v:`${AUDITS.filter(a=>a.score>=90).length}`, l:"Critical gaps found", c:"text-violet-400" },
          ].map(s=>(
            <div key={s.l} className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 text-center">
              <div className={`text-3xl font-black font-mono ${s.c}`}>{s.v}</div>
              <div className="text-[11px] text-white/25 uppercase tracking-widest mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/3 rounded-xl p-1 w-fit mb-8">
          {[["waitlist","Join Waitlist"],["audits","All 14 Audits"]].map(([id,l])=>(
            <button key={id} onClick={()=>setTab(id)}
              className={`text-xs px-5 py-2 rounded-lg font-medium transition-all ${tab===id?"bg-white/10 text-white":"text-white/35 hover:text-white/60"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Waitlist */}
        {tab === "waitlist" && (
          <div className="max-w-md mx-auto pb-20">
            {!submitted ? (
              <div className="bg-[#0f0f0f] border border-white/8 rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-1.5">Get your free AI audit</h2>
                <p className="text-white/35 text-sm mb-7 leading-relaxed">
                  14-point AI gap analysis for your practice area. First 20 firms free — then $299.
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="your@lawfirm.com.au" required
                    className="w-full bg-black/50 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
                  />
                  <button type="submit" disabled={loading}
                    className="w-full bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-white/90 transition-all disabled:opacity-40">
                    {loading ? "…" : "Get free audit →"}
                  </button>
                </form>
                <div className="mt-6 space-y-2">
                  {["Your firm's AI Search Gap Score (0–100)","Hours your team wastes on manual tasks each week","3 specific AI tools that fix your biggest bottleneck","ROI calculation at your billing rate"].map(t=>(
                    <div key={t} className="flex items-center gap-2.5 text-xs text-white/40">
                      <span className="text-emerald-400/70 shrink-0">✓</span>{t}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#0f0f0f] border border-emerald-500/20 rounded-3xl p-10 text-center">
                <div className="text-4xl mb-4">✓</div>
                <h2 className="text-xl font-bold text-emerald-300 mb-2">You're on the list.</h2>
                <p className="text-white/40 text-sm">Audit delivered within 24 hours to <span className="text-white/60">{email}</span></p>
                <button onClick={()=>setTab("audits")} className="mt-5 text-xs text-white/30 hover:text-white/60 transition-colors">
                  View all 14 audits →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Audits */}
        {tab === "audits" && (
          <div className="pb-20">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex gap-1.5 flex-wrap">
                {[["all","All 14"],["critical","Critical"],["Ringwood","Ringwood"],["Melbourne CBD","CBD"]].map(([id,l])=>(
                  <button key={id} onClick={()=>setFilter(id)}
                    className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${filter===id?"bg-white/8 border-white/15 text-white/80":"border-white/6 text-white/30 hover:border-white/10 hover:text-white/55"}`}>
                    {l}
                  </button>
                ))}
              </div>
              <span className="text-white/20 text-[11px]">{filtered.length} firms</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              {filtered.map((a,i) => {
                const open = active === i;
                return (
                  <div key={i} className={`rounded-2xl border transition-all overflow-hidden ${scBg(a.score)} ${open?"bg-[#0f0f0f]":"bg-[#0a0a0a] hover:bg-[#0f0f0f]"}`}>
                    <div className="p-4 cursor-pointer" onClick={()=>setActive(open?null:i)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-white/75 font-semibold text-sm">{a.firm}</p>
                          <p className="text-white/30 text-xs mt-0.5">{a.suburb} · {a.type}</p>
                        </div>
                        <div className={`text-2xl font-black font-mono shrink-0 ${sc(a.score)}`}>{a.score}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="bg-black/30 rounded-lg px-3 py-2">
                          <p className="text-white/25 text-[10px]">Hours/week</p>
                          <p className="text-orange-400 font-bold text-sm">{a.hours}h</p>
                        </div>
                        <div className="bg-black/30 rounded-lg px-3 py-2">
                          <p className="text-white/25 text-[10px]">Cost/month</p>
                          <p className="text-red-400 font-bold text-sm">{a.cost}</p>
                        </div>
                      </div>
                    </div>

                    {open && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase text-red-400/70 mb-1">Gap</p>
                          <p className="text-white/50 text-xs leading-relaxed">{a.gap}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-400/70 mb-1">Fix</p>
                          <p className="text-white/50 text-xs leading-relaxed">{a.fix}</p>
                        </div>
                        <div className="flex items-start justify-between gap-2 bg-amber-500/6 border border-amber-500/12 rounded-xl px-4 py-3">
                          <p className="text-amber-200/60 text-xs italic">"{a.subject}"</p>
                          <button onClick={()=>copy(a.subject,`s${i}`)} className="text-[10px] text-white/20 hover:text-white/50 shrink-0 transition-colors">{copied===`s${i}`?"✓":"copy"}</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <button onClick={()=>setTab("waitlist")}
                className="bg-white text-black font-semibold px-8 py-3 rounded-xl text-sm hover:bg-white/90 transition-all">
                Get your firm's free audit →
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-white/4 py-5 text-center text-white/15 text-[10px] tracking-widest uppercase">
        Capital Colony · AI Legal Discovery · Melbourne VIC · Signal 92/100 · YABAI
      </footer>
    </div>
  );
}
