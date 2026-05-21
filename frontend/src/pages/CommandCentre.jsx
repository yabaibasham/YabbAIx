import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { Zap, Radio, Target, BarChart3, MessageSquare, Wallet, ArrowRight } from "lucide-react";
import logger from "@/utils/logger";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CommandCentre() {
  const [data, setData] = useState(null);
  const [yieldData, setYieldData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [d, y] = await Promise.all([
        axios.get(`${API}/yabbai/treasury`),
        axios.get(`${API}/yabbai/yield-summary`),
      ]);
      setData(d.data);
      setYieldData(y.data);
    } catch (e) { logger.warn("Command Centre load failed", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, [load]);

  const stats = data?.ecosystem_stats || {};
  const yd = yieldData || {};

  const navCards = [
    { to: "/yabbai-missions", icon: Target, label: "Missions", desc: "Launch & manage DeFi missions", color: "#00F0FF" },
    { to: "/pump-scanner", icon: BarChart3, label: "Pump Scanner", desc: "6-factor token scoring", color: "#6B2FFF" },
    { to: "/yabbai-agent", icon: MessageSquare, label: "Agent", desc: "Grok xAI powered assistant", color: "#F7B731" },
    { to: "/yabbai-yield", icon: Zap, label: "Yield", desc: "Reward token breakdown", color: "#22C55E" },
    { to: "/yabbai-treasury", icon: Wallet, label: "Treasury", desc: "Wallets & cashout", color: "#00D4AA" },
    { to: "/gold-hunter", icon: Radio, label: "Gold Hunter", desc: "Autonomous income agents", color: "#FFB800" },
  ];

  return (
    <div data-testid="command-centre-page" className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Orbitron', monospace", color: "#00F0FF" }}>Command Centre</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>YABBAI v5 Autonomous Mission Control</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { v: stats.total_missions || 0, l: "Missions", c: "#00F0FF" },
          { v: stats.active_missions || 0, l: "Active", c: "#22C55E" },
          { v: (yd.total_reward_tokens || 0).toFixed(2), l: "Reward Tokens", c: "#F7B731" },
          { v: `$${(yd.reward_token_value_usd || 0).toFixed(4)}`, l: "Token Value", c: "#6B2FFF" },
        ].map((s) => (
          <div key={s.l} className="rounded-sm p-4" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}20` }}>
            <div className="text-xl font-black font-mono" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Background Yield Card */}
      <div className="rounded-sm p-5" style={{ background: "rgba(0,240,255,0.03)", border: "1px solid rgba(0,240,255,0.1)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#00F0FF" }}>Background $0 Strategy Yields</p>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(yd.by_strategy || {}).length > 0 ? (
            Object.entries(yd.by_strategy).map(([sid, tokens]) => (
              <div key={sid} className="rounded-sm p-3" style={{ background: "rgba(0,0,0,0.3)" }}>
                <p className="text-[10px] font-mono truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{sid}</p>
                <p className="text-sm font-black font-mono" style={{ color: "#00F0FF" }}>{tokens.toFixed(4)}</p>
                <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>tokens earned</p>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-4">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Launch a mission to start earning reward tokens</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-3 gap-3">
        {navCards.map((card) => (
          <NavLink key={card.to} to={card.to} data-testid={`nav-${card.label.toLowerCase()}`}
            className="rounded-sm p-5 transition-all hover:translate-y-[-2px]"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${card.color}15` }}>
            <card.icon size={20} style={{ color: card.color }} className="mb-3" />
            <p className="text-sm font-bold mb-1" style={{ color: "#F9FAFB" }}>{card.label}</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{card.desc}</p>
            <ArrowRight size={14} className="mt-2" style={{ color: card.color }} />
          </NavLink>
        ))}
      </div>
    </div>
  );
}
