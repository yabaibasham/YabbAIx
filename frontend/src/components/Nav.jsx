import { NavLink, useLocation } from "react-router-dom";
import { Zap, Target, BarChart3, MessageSquare, TrendingUp, Wallet, Activity, Radio, Crosshair, Compass, Pickaxe, Banknote } from "lucide-react";

const yabbaiLinks = [
  { to: "/", label: "Home", icon: Zap },
  { to: "/command-centre", label: "Command", icon: Activity },
  { to: "/yabbai-missions", label: "Missions", icon: Target },
  { to: "/pump-scanner", label: "Scanner", icon: BarChart3 },
  { to: "/yabbai-agent", label: "Agent", icon: MessageSquare },
  { to: "/yabbai-yield", label: "Yield", icon: TrendingUp },
  { to: "/yabbai-treasury", label: "Treasury", icon: Wallet },
];

const goldHunterLinks = [
  { to: "/dashboard", label: "Colonies", icon: Activity },
  { to: "/gold-hunter", label: "Gold Hunter", icon: Pickaxe },
  { to: "/treasury", label: "Vault", icon: Banknote },
  { to: "/control-room", label: "Control Room", icon: Radio },
  { to: "/rover", label: "Rover", icon: Compass },
];

export default function Nav() {
  const location = useLocation();
  const isGoldHunter = ["/dashboard", "/gold-hunter", "/treasury", "/control-room", "/strike-deck", "/rover", "/capital-colony", "/legal-colony", "/partner-view"].includes(location.pathname);
  const links = isGoldHunter ? goldHunterLinks : yabbaiLinks;

  return (
    <nav data-testid="main-nav" className="sticky top-0 z-40 border-b" style={{ background: "rgba(5,8,8,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(0,240,255,0.1)" }}>
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-black" style={{ background: "#00F0FF", color: "#050808" }}>Y</div>
          <span className="text-xs font-black font-mono" style={{ color: "#00F0FF" }}>YABBAI</span>
          <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>v5</span>
        </NavLink>

        <div className="flex items-center gap-0.5 overflow-x-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} data-testid={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}
              className={({ isActive }) => `flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-sm transition-all whitespace-nowrap ${isActive ? "" : "hover:bg-white/5"}`}
              style={({ isActive }) => isActive ? { background: "#00F0FF", color: "#050808" } : { color: "rgba(255,255,255,0.4)" }}>
              <Icon size={11} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}

          {!isGoldHunter && (
            <NavLink to="/dashboard" className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-sm ml-1 transition-all"
              style={{ color: "#FFB800", background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.15)" }}>
              <Pickaxe size={11} /> Gold Hunter
            </NavLink>
          )}
          {isGoldHunter && (
            <NavLink to="/" className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-sm ml-1 transition-all"
              style={{ color: "#00F0FF", background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.15)" }}>
              <Zap size={11} /> YABBAI v5
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
