import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "@/components/Nav";

// Original YABAI pages
import Dashboard from "@/pages/Dashboard";
import GoldHunter from "@/pages/GoldHunter";
import Treasury from "@/pages/Treasury";
import ControlRoom from "@/pages/ControlRoom";
import StrikeDeck from "@/pages/StrikeDeck";
import Rover from "@/pages/Rover";
import CapitalColony from "@/pages/CapitalColony";
import LegalColony from "@/pages/LegalColony";
import PartnerView from "@/pages/PartnerView";
import PaymentSuccess from "@/pages/PaymentSuccess";

// YABBAI v5 DeFi pages
import YabbaiLanding from "@/pages/YabbaiLanding";
import CommandCentre from "@/pages/CommandCentre";
import YabbaiMissions from "@/pages/YabbaiMissions";
import PumpScanner from "@/pages/PumpScanner";
import YabbaiAgent from "@/pages/YabbaiAgent";
import YabbaiYield from "@/pages/YabbaiYield";
import YabbaiTreasury from "@/pages/YabbaiTreasury";

function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#050808" }}>
      <BrowserRouter>
        <Nav />
        <Routes>
          {/* YABBAI v5 DeFi */}
          <Route path="/" element={<YabbaiLanding />} />
          <Route path="/command-centre" element={<CommandCentre />} />
          <Route path="/yabbai-missions" element={<YabbaiMissions />} />
          <Route path="/pump-scanner" element={<PumpScanner />} />
          <Route path="/yabbai-agent" element={<YabbaiAgent />} />
          <Route path="/yabbai-yield" element={<YabbaiYield />} />
          <Route path="/yabbai-treasury" element={<YabbaiTreasury />} />

          {/* Original YABAI Gold-Hunter */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gold-hunter" element={<GoldHunter />} />
          <Route path="/treasury" element={<Treasury />} />
          <Route path="/control-room" element={<ControlRoom />} />
          <Route path="/strike-deck" element={<StrikeDeck />} />
          <Route path="/rover" element={<Rover />} />
          <Route path="/capital-colony" element={<CapitalColony />} />
          <Route path="/legal-colony" element={<LegalColony />} />
          <Route path="/partner-view" element={<PartnerView />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
        <footer className="mt-16 py-5 text-center text-[10px] tracking-widest uppercase" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.1)" }}>
          YABBAI v5 · Solana DeFi Ecosystem · Gold-Hunter Swarm · 24/7
        </footer>
      </BrowserRouter>
    </div>
  );
}

export default App;
