import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Zap, Shield, Globe, ArrowRight, Cpu } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function YabbaiLanding() {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await axios.post(`${API}/yabbai/early-access`, { email, wallet_address: wallet });
      setSubmitted(true);
    } catch {}
  };

  return (
    <div data-testid="yabbai-landing" style={{ background: "#050808", minHeight: "100vh", color: "#F9FAFB" }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(0,240,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(107,47,255,0.06) 0%, transparent 50%)" }} />
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 relative">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] font-mono px-3 py-1 rounded-sm" style={{ background: "rgba(0,240,255,0.1)", color: "#00F0FF", border: "1px solid rgba(0,240,255,0.2)" }}>
              YABBAI v5 ECOSYSTEM
            </span>
            <span className="text-[10px] font-mono px-3 py-1 rounded-sm" style={{ background: "rgba(247,183,49,0.1)", color: "#F7B731", border: "1px solid rgba(247,183,49,0.2)" }}>
              SOLANA
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-6" style={{ fontFamily: "'Orbitron', monospace" }}>
            <span style={{ color: "#00F0FF" }}>$0 CAPITAL</span><br />
            <span style={{ color: "#F9FAFB" }}>MISSION</span><br />
            <span style={{ color: "#6B2FFF" }}>OPERATOR</span>
          </h1>

          <p className="text-lg max-w-xl mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            Autonomous multi-token Solana DeFi ecosystem. Start with $20 minimum deposit + 4 background $0 capital strategies earning YABBAI Reward Tokens 24/7.
          </p>
          <p className="text-sm max-w-lg mb-8" style={{ color: "rgba(255,255,255,0.3)" }}>
            5 interconnected tokens. Shared treasury. Autonomous engine. Autopayout.
          </p>

          <div className="flex gap-3 mb-12">
            <NavLink to="/command-centre" data-testid="enter-command-centre"
              className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-sm transition-all"
              style={{ background: "#00F0FF", color: "#050808" }}>
              Enter Command Centre <ArrowRight size={16} />
            </NavLink>
            <NavLink to="/yabbai-missions"
              className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-sm transition-all"
              style={{ background: "rgba(107,47,255,0.15)", color: "#6B2FFF", border: "1px solid rgba(107,47,255,0.3)" }}>
              Launch Mission <Zap size={16} />
            </NavLink>
          </div>

          {/* Token Ecosystem */}
          <div className="grid grid-cols-5 gap-2 mb-12">
            {[
              { sym: "$YABBAI", role: "Main Hub", c: "#00F0FF" },
              { sym: "$BASH", role: "Terminal/CTF", c: "#6B2FFF" },
              { sym: "$YABBIE", role: "Ocean Scout", c: "#00D4AA" },
              { sym: "$HOMEGROWN", role: "AU Community", c: "#F7B731" },
              { sym: "$GREENHOUSE", role: "Garden", c: "#22C55E" },
            ].map((t) => (
              <div key={t.sym} className="rounded-sm p-3 text-center" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${t.c}20`, backdropFilter: "blur(8px)" }}>
                <p className="text-sm font-black font-mono" style={{ color: t.c }}>{t.sym}</p>
                <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{t.role}</p>
              </div>
            ))}
          </div>

          {/* Strategies */}
          <div className="grid grid-cols-2 gap-3 mb-12">
            {[
              { icon: Globe, name: "Testnet Farming", desc: "Incentivized network participation", apy: "12.5%" },
              { icon: Cpu, name: "DEX Points Farming", desc: "Perp DEX volume strategies", apy: "8.2%" },
              { icon: Zap, name: "Prediction Markets", desc: "Automated market participation", apy: "15.0%" },
              { icon: Shield, name: "Stablecoin Quests", desc: "Cross-chain wrapper yields", apy: "6.5%" },
            ].map((s) => (
              <div key={s.name} className="rounded-sm p-4" style={{ background: "rgba(0,240,255,0.03)", border: "1px solid rgba(0,240,255,0.1)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={16} style={{ color: "#00F0FF" }} />
                  <span className="text-xs font-bold" style={{ color: "#F9FAFB" }}>{s.name}</span>
                  <span className="ml-auto text-xs font-mono font-bold" style={{ color: "#00F0FF" }}>{s.apy}</span>
                </div>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{s.desc} — $0 capital required</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Early Access */}
      <div className="max-w-lg mx-auto px-6 pb-20">
        {!submitted ? (
          <div className="rounded-sm p-6" style={{ background: "rgba(0,240,255,0.03)", border: "1px solid rgba(0,240,255,0.15)" }}>
            <h2 className="text-xl font-black mb-1" style={{ fontFamily: "'Orbitron', monospace", color: "#00F0FF" }}>Early Access</h2>
            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>Join the YABBAI ecosystem. First 500 wallets get priority mission allocation.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input data-testid="early-access-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                className="w-full rounded-sm px-4 py-3 text-sm focus:outline-none" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,240,255,0.2)", color: "#F9FAFB" }} />
              <input data-testid="early-access-wallet" value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="Solana wallet (optional)"
                className="w-full rounded-sm px-4 py-3 text-sm font-mono focus:outline-none" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,240,255,0.1)", color: "#F9FAFB" }} />
              <button data-testid="early-access-submit" type="submit" className="w-full text-sm font-bold py-3 rounded-sm" style={{ background: "#00F0FF", color: "#050808" }}>
                Request Early Access
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-sm p-8 text-center" style={{ background: "rgba(0,240,255,0.05)", border: "1px solid rgba(0,240,255,0.2)" }}>
            <Zap size={32} className="mx-auto mb-3" style={{ color: "#00F0FF" }} />
            <h2 className="text-lg font-black" style={{ color: "#00F0FF" }}>You're In</h2>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Priority mission allocation confirmed.</p>
          </div>
        )}

        <p className="text-[10px] text-center mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
          YABBAI v5 is an experimental DeFi platform. Simulated reward tokens shown are projections.
          Not financial advice. DYOR. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}
