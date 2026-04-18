import { NavLink } from "react-router-dom";
import { Activity, Radio, Crosshair, Compass, Building2, Scale, Users, Pickaxe, Banknote } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/gold-hunter", label: "Gold Hunter", icon: Pickaxe },
  { to: "/treasury", label: "Treasury", icon: Banknote },
  { to: "/control-room", label: "Control Room", icon: Radio },
  { to: "/strike-deck", label: "Strike Deck", icon: Crosshair },
  { to: "/rover", label: "Rover", icon: Compass },
  { to: "/capital-colony", label: "Capital Colony", icon: Building2 },
  { to: "/legal-colony", label: "Legal Colony", icon: Scale },
  { to: "/partner-view", label: "Partner View", icon: Users },
];

export default function Nav() {
  return (
    <nav
      data-testid="main-nav"
      className="sticky top-0 z-40 border-b"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-sm flex items-center justify-center text-xs font-black text-black"
            style={{ background: "var(--yb-gold)" }}
          >
            Y
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--yb-text-primary)" }}>
            YABAI
          </span>
        </NavLink>

        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-sm transition-all whitespace-nowrap ${
                  isActive
                    ? "text-black"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: "var(--yb-gold)", color: "#000" }
                  : {}
              }
            >
              <Icon size={13} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
