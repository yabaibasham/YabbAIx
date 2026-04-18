import { useState } from "react";
import { DigitalAsset } from "@/api/entities";

export default function CapitalColony() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count] = useState(247);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      await DigitalAsset.create({
        timeline_id: "69df1d35fc9a8b8d89ac8715",
        asset_type: "Email Capture",
        title: `Lead: ${email}`,
        content: email,
        status: "Live",
        signal_at_creation: 92,
        niche: "legal-tech",
        mrr_estimate: "$50,000–$200,000/mo",
        email_captures: 1,
      });
    } catch { }
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-white" style={{ background: "#080808", fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-black text-black">L</div>
            <span className="text-sm font-semibold text-white/80">LexAI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 px-2.5 py-1 rounded-lg">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
              {count} on waitlist
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6">

        {/* Hero */}
        <div className="pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 text-[11px] text-white/40 border border-white/8 px-3 py-1.5 rounded-full mb-8">
            <span className="w-1 h-1 bg-amber-400 rounded-full" />
            Signal 92 · Melbourne Legal Tech · AI Discovery Gap
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-6">
            Your law firm is<br />
            <span style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              invisible to AI.
            </span>
          </h1>

          <p className="text-lg text-white/40 leading-relaxed max-w-xl mx-auto mb-3">
            While your clients ask ChatGPT and Perplexity to find a lawyer in Melbourne — your firm doesn't appear in the answer.
          </p>
          <p className="text-base text-white/25 max-w-lg mx-auto">
            LexAI fixes your AI search presence in 48 hours — structured schema, FAQ blocks, and document automation.
          </p>
        </div>

        {/* Two columns — problem / solution */}
        <div className="grid sm:grid-cols-2 gap-3 mb-12">
          <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5">
            <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-4">The Problem</p>
            <ul className="space-y-3">
              {[
                "Clients ask AI "best family lawyer Ringwood" — you don't show up",
                "AI surfaces government sites and aggregators, not your firm",
                "No schema = AI can't verify your location or specialty",
                "Competitors with schema steal your referrals daily",
              ].map(t => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-white/45 leading-relaxed">
                  <span className="text-red-500/60 mt-0.5 shrink-0">✕</span>{t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">The Fix</p>
            <ul className="space-y-3">
              {[
                "AI-ready JSON-LD schema installed on your site in 48h",
                "FAQ blocks that answer your clients' exact AI queries",
                "AI contract review tool — a new revenue stream for your firm",
                "Monthly AI presence reports vs. competitor benchmarks",
              ].map(t => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-white/45 leading-relaxed">
                  <span className="text-emerald-500/70 mt-0.5 shrink-0">✓</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-12">
          {[
            { v: "48h", l: "Setup time" },
            { v: "$200", l: "Flat fee" },
            { v: "$1,200+", l: "Avg new MRR" },
          ].map(s => (
            <div key={s.l} className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 text-center">
              <div className="text-2xl font-black text-white/80 mb-1">{s.v}</div>
              <div className="text-[11px] text-white/30 uppercase tracking-widest">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Waitlist form */}
        <div className="mb-20">
          {!submitted ? (
            <div className="bg-[#0f0f0f] border border-white/8 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-1.5 text-center">Get your free AI audit</h2>
              <p className="text-white/35 text-sm text-center mb-8 leading-relaxed">
                We'll run a 14-point AI gap analysis for your practice area.<br />
                First 20 firms get it free — then it's $299.
              </p>
              <form onSubmit={handleSubmit} className="flex gap-2.5">
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@lawfirm.com.au" required
                  className="flex-1 bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
                />
                <button type="submit" disabled={loading}
                  className="bg-white text-black font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/90 transition-all whitespace-nowrap disabled:opacity-40">
                  {loading ? "…" : "Join waitlist →"}
                </button>
              </form>
              <p className="text-white/15 text-[11px] text-center mt-4">
                {count} Melbourne law firms on the waitlist · No spam · Cancel anytime
              </p>
            </div>
          ) : (
            <div className="bg-[#0f0f0f] border border-emerald-500/20 rounded-3xl p-10 text-center">
              <div className="text-4xl mb-4">✓</div>
              <h2 className="text-xl font-bold text-emerald-300 mb-2">You're on the list.</h2>
              <p className="text-white/40 text-sm">
                Your free AI audit will be in your inbox within 24 hours.<br />
                Sent to <span className="text-white/60">{email}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/5 py-6 text-center text-white/15 text-[11px]">
        © 2026 LexAI by YABAI · AI Legal Discovery · Melbourne VIC · Signal 92/100
      </footer>
    </div>
  );
}
