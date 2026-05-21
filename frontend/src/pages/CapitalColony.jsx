import { useState } from "react";
import { DigitalAsset } from "@/api/entities";
import { Building2, ArrowRight, Check } from "lucide-react";
import logger from "@/utils/logger";

export default function CapitalColony() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      await DigitalAsset.create({ asset_type: "Email Capture", title: `Lead: ${email}`, content: email, status: "Live", signal_at_creation: 92, niche: "legal-tech", mrr_estimate: "$50,000-$200,000/mo", email_captures: 1 });
    } catch (err) {
      logger.error("Waitlist submission failed", err);
    }
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div data-testid="capital-colony-page" className="max-w-3xl mx-auto px-6">
      <div className="pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-sm mb-8" style={{ color: "var(--yb-text-muted)", border: "1px solid var(--yb-border)" }}>
          <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: "var(--yb-gold)" }} />
          Signal 92 · Melbourne Legal Tech · AI Discovery Gap
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight mb-6" style={{ color: "var(--yb-text-primary)" }}>
          Your law firm is<br />
          <span style={{ color: "var(--yb-gold)" }}>invisible to AI.</span>
        </h1>
        <p className="text-lg leading-relaxed max-w-xl mx-auto mb-3" style={{ color: "var(--yb-text-secondary)" }}>
          While your clients ask ChatGPT and Perplexity to find a lawyer in Melbourne — your firm doesn't appear in the answer.
        </p>
        <p className="text-base max-w-lg mx-auto" style={{ color: "var(--yb-text-muted)" }}>
          LexAI fixes your AI search presence in 48 hours.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        <div className="rounded-sm p-5" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#ef4444" }}>The Problem</p>
          {["Clients ask AI 'best lawyer Ringwood' — you don't show up", "AI surfaces government sites instead of your firm", "No schema = AI can't verify your location", "Competitors with schema steal your referrals"].map((t) => (
            <p key={t} className="flex items-start gap-2 text-sm leading-relaxed mb-2" style={{ color: "var(--yb-text-secondary)" }}>
              <span style={{ color: "#ef4444" }}>x</span> {t}
            </p>
          ))}
        </div>
        <div className="rounded-sm p-5" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#22c55e" }}>The Fix</p>
          {["AI-ready JSON-LD schema installed in 48h", "FAQ blocks answering your clients' AI queries", "AI contract review tool — new revenue stream", "Monthly AI presence reports vs competitors"].map((t) => (
            <p key={t} className="flex items-start gap-2 text-sm leading-relaxed mb-2" style={{ color: "var(--yb-text-secondary)" }}>
              <span style={{ color: "#22c55e" }}><Check size={14} /></span> {t}
            </p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-12">
        {[{ v: "48h", l: "Setup time" }, { v: "$200", l: "Flat fee" }, { v: "$1,200+", l: "Avg new MRR" }].map((s) => (
          <div key={s.l} className="rounded-sm p-5 text-center" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <div className="text-2xl font-black" style={{ color: "var(--yb-text-primary)" }}>{s.v}</div>
            <div className="text-[11px] uppercase tracking-widest mt-1" style={{ color: "var(--yb-text-muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="mb-20">
        {!submitted ? (
          <div className="rounded-sm p-8" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <h2 className="text-2xl font-bold mb-1.5 text-center" style={{ color: "var(--yb-text-primary)" }}>Get your free AI audit</h2>
            <p className="text-sm text-center mb-8" style={{ color: "var(--yb-text-muted)" }}>14-point AI gap analysis. First 20 firms free — then $299.</p>
            <form onSubmit={handleSubmit} className="flex gap-2.5">
              <input data-testid="waitlist-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@lawfirm.com.au" required
                className="flex-1 rounded-sm px-4 py-3 text-sm focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--yb-border)", color: "var(--yb-text-primary)" }} />
              <button data-testid="waitlist-submit" type="submit" disabled={loading}
                className="font-bold px-6 py-3 rounded-sm text-sm transition-all disabled:opacity-40"
                style={{ background: "var(--yb-gold)", color: "#000" }}>
                {loading ? "..." : "Join waitlist"}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-sm p-10 text-center" style={{ background: "var(--yb-surface-1)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <Check size={40} className="mx-auto mb-3" color="#22c55e" />
            <h2 className="text-xl font-bold mb-2" style={{ color: "#22c55e" }}>You're on the list.</h2>
            <p className="text-sm" style={{ color: "var(--yb-text-secondary)" }}>Audit delivered within 24 hours to <span style={{ color: "var(--yb-text-primary)" }}>{email}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
