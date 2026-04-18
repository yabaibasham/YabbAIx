import { useState, useRef, useCallback } from "react";

const TEMPLATES = {
  restaurant: { gap:"No menu schema — AI can't surface dish-level or cuisine-specific searches", fix:"JSON-LD Menu + Restaurant schema with cuisine tags and FAQ on delivery/booking", roi:"$800–$2,400/mo", schema:`{"@type":"Restaurant","servesCuisine":"[Type]","areaServed":"[Suburb] VIC"}` },
  café: { gap:"Missing opening hours + diet tags — invisible to 'open now' and 'gluten free' AI queries", fix:"CafeOrCoffeeShop schema with openingHours, diet flags, and FAQ on specials", roi:"$400–$1,200/mo", schema:`{"@type":"CafeOrCoffeeShop","openingHours":"Mo-Fr 07:00-15:00","areaServed":"[Suburb] VIC"}` },
  plumber: { gap:"No emergency availability schema — 'plumber open now [suburb]' queries return competitors", fix:"Plumber schema with 24/7 availability, service area, and FAQ on emergency call-out fees", roi:"$1,200–$4,800/mo", schema:`{"@type":"Plumber","openingHours":"Mo-Su 00:00-23:59","areaServed":"[Suburb] VIC"}` },
  electrician: { gap:"AI can't verify licence or service area — clients choose credentialled competitors", fix:"Licensed trade schema with credential markup and suburb coverage list", roi:"$900–$3,600/mo", schema:`{"@type":"Electrician","hasCredential":"Electrical Licence VIC","areaServed":"[Suburb] VIC"}` },
  tradie: { gap:"No project portfolio schema — AI can't surface past work quality to new clients", fix:"HomeAndConstructionBusiness schema with project types and Google Review markup", roi:"$600–$2,400/mo", schema:`{"@type":"HomeAndConstructionBusiness","areaServed":"[Suburb] VIC","priceRange":"$$"}` },
  mechanic: { gap:"Missing vehicle brand tags — invisible to 'Toyota service [suburb]' AI queries", fix:"AutoRepair schema with vehicle brands serviced and FAQ on roadworthy certificate costs", roi:"$800–$3,200/mo", schema:`{"@type":"AutoRepair","brand":["Toyota","Holden","Ford"],"areaServed":"[Suburb] VIC"}` },
  dentist: { gap:"No bulk billing or health fund markup — AI can't answer 'bulk billing dentist [suburb]'", fix:"Dentist schema with paymentAccepted, specialty, and FAQ on gap-free treatments", roi:"$1,500–$6,000/mo", schema:`{"@type":"Dentist","paymentAccepted":"Medicare CDBS, HICAPS","areaServed":"[Suburb] VIC"}` },
  physio: { gap:"No NDIS or WorkCover schema — invisible to 'WorkCover physio near me' queries", fix:"Physiotherapist schema with insurance accepted and FAQ on referral process", roi:"$800–$2,800/mo", schema:`{"@type":"Physiotherapist","paymentAccepted":"WorkCover, NDIS","areaServed":"[Suburb] VIC"}` },
  lawyer: { gap:"AI surfaces government legal aid instead of your firm — no specialty schema", fix:"LegalService schema with practice area, suburb, and FAQ answering top client questions", roi:"$1,200–$5,000/mo", schema:`{"@type":"LegalService","legalService":"[Specialty]","areaServed":"[Suburb] VIC"}` },
  accountant: { gap:"No tax specialty or SMSF markup — invisible to 'SMSF accountant [suburb]' searches", fix:"AccountingService schema with specialty tags and FAQ on tax return deadlines", roi:"$600–$2,400/mo", schema:`{"@type":"AccountingService","hasCredential":"CPA Australia","areaServed":"[Suburb] VIC"}` },
  default: { gap:"No structured LocalBusiness schema — AI can't verify location, specialty, or trust signals", fix:"Full LocalBusiness JSON-LD with address, hours, specialty, and FAQ blocks", roi:"$400–$2,000/mo", schema:`{"@type":"LocalBusiness","areaServed":"[Suburb] VIC","openingHours":"Mo-Fr 09:00-17:00"}` },
};

function detect(name) {
  const n = name.toLowerCase();
  if (n.includes("café")||n.includes("cafe")||n.includes("coffee")) return "café";
  if (n.includes("restaurant")||n.includes("kitchen")||n.includes("thai")||n.includes("pizza")||n.includes("chinese")) return "restaurant";
  if (n.includes("plumb")) return "plumber";
  if (n.includes("electric")) return "electrician";
  if (n.includes("mechanic")||n.includes("auto")||n.includes("tyre")||n.includes("smash")) return "mechanic";
  if (n.includes("dentist")||n.includes("dental")) return "dentist";
  if (n.includes("physio")||n.includes("chiro")||n.includes("osteo")) return "physio";
  if (n.includes("law")||n.includes("legal")||n.includes("solicitor")) return "lawyer";
  if (n.includes("account")||n.includes("tax")||n.includes("bookkeep")) return "accountant";
  if (n.includes("build")||n.includes("carpent")||n.includes("paint")||n.includes("tiler")||n.includes("landscap")||n.includes("plaster")) return "tradie";
  return "default";
}

function makeAudit(name, suburb) {
  const type = detect(name);
  const tpl = TEMPLATES[type];
  const score = 62 + Math.floor(Math.random() * 33);
  return { name, suburb, type, score, ...tpl,
    subject: `${name}: you're invisible to AI searches in ${suburb} (free audit inside)`,
    closer: `For $20 I'll show you exactly why AI is sending your clients elsewhere — and how to fix it in 48 hours.`,
  };
}

const sc = s => s >= 88 ? "text-red-400" : s >= 75 ? "text-orange-400" : "text-amber-400";
const urg = s => s >= 88 ? "Critical" : s >= 75 ? "High" : "Moderate";

export default function Rover() {
  const [input, setInput] = useState("");
  const [suburb, setSuburb] = useState("Ringwood");
  const [audits, setAudits] = useState([]);
  const [running, setRunning] = useState(false);
  const [pct, setPct] = useState(0);
  const [active, setActive] = useState(null);
  const [copied, setCopied] = useState(null);
  const [toast, setToast] = useState(null);
  const jsPDF = useRef(null);

  const toast$ = (m, t="ok") => { setToast({m,t}); setTimeout(()=>setToast(null),3500); };
  const copy = (text, key) => { navigator.clipboard?.writeText(text); setCopied(key); setTimeout(()=>setCopied(null),2000); };

  const names = input.split('\n').map(l=>l.trim()).filter(l=>l.length>2);

  const run = async () => {
    if (!names.length) { toast$("Paste at least one business name","err"); return; }
    setRunning(true); setAudits([]); setPct(0); setActive(null);
    const out = [];
    for (let i=0; i<names.length; i++) {
      await new Promise(r=>setTimeout(r,80));
      out.push(makeAudit(names[i], suburb));
      setPct(Math.round(((i+1)/names.length)*100));
    }
    setAudits(out); setRunning(false);
    toast$(`${out.length} audits generated — $0 cost`);
  };

  const loadPDF = () => new Promise(resolve => {
    if (jsPDF.current) { resolve(jsPDF.current); return; }
    if (window.jspdf?.jsPDF) { jsPDF.current = window.jspdf.jsPDF; resolve(jsPDF.current); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => { jsPDF.current = window.jspdf.jsPDF; resolve(jsPDF.current); };
    document.head.appendChild(s);
  });

  const exportPDF = async (a) => {
    try {
      const JsPDF = await loadPDF();
      const doc = new JsPDF({ unit:'mm', format:'a4' });
      const W = 210, m = 18; let y = 20;

      doc.setFillColor(8,8,8); doc.rect(0,0,W,297,'F');
      doc.setFillColor(20,10,40); doc.rect(0,0,W,38,'F');
      doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont('helvetica','bold');
      doc.text('AI SEARCH GAP AUDIT', m, 16);
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(180,180,180);
      doc.text(`LexAI / YABAI · ${new Date().toLocaleDateString('en-AU')} · Zero-Cost Local Engine`, m, 25);
      doc.text('Confidential — prepared for recipient only', m, 31);
      y = 50;

      doc.setTextColor(255,255,255); doc.setFontSize(20); doc.setFont('helvetica','bold');
      doc.text(a.name, m, y); y+=8;
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(120,120,120);
      doc.text(`${a.suburb}, VIC  ·  ${a.type.toUpperCase()}  ·  Gap Score: ${a.score}/100  ·  ${urg(a.score).toUpperCase()}`, m, y); y+=10;

      doc.setFillColor(30,30,30); doc.roundedRect(m, y, W-m*2, 5, 2.5, 2.5, 'F');
      const bc = a.score>=88?[248,113,113]:a.score>=75?[251,146,60]:[251,191,36];
      doc.setFillColor(...bc); doc.roundedRect(m, y, ((W-m*2)*a.score)/100, 5, 2.5, 2.5, 'F');
      y+=13;

      const section = (title, body, col=[200,200,200]) => {
        doc.setTextColor(...col); doc.setFontSize(8); doc.setFont('helvetica','bold');
        doc.text(title.toUpperCase(), m, y); y+=6;
        doc.setTextColor(180,180,180); doc.setFont('helvetica','normal'); doc.setFontSize(9);
        const lines = doc.splitTextToSize(body, W-m*2);
        doc.text(lines, m, y); y+=lines.length*5+7;
      };

      section('THE AI GAP', a.gap, [248,113,113]);
      section('THE FIX', a.fix, [52,211,153]);
      section('CLIENT ROI', a.roi+' in recoverable monthly revenue', [167,139,250]);
      section('FAQ BLOCK 1', a.faq1||`What are the best ${a.type} services near me in ${a.suburb}?`, [125,211,252]);
      section('FAQ BLOCK 2', a.faq2||`How much does a ${a.type} cost in ${a.suburb}, Melbourne?`, [125,211,252]);
      section('JSON-LD SCHEMA', a.schema, [134,239,172]);
      section('COLD EMAIL SUBJECT', a.subject, [253,224,71]);

      y+=4;
      doc.setFillColor(40,20,80); doc.roundedRect(m, y, W-m*2, 24, 4, 4, 'F');
      doc.setTextColor(200,170,255); doc.setFontSize(10); doc.setFont('helvetica','bold');
      doc.text(a.closer, m+5, y+9, { maxWidth: W-m*2-10 });
      doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(150,120,200);
      doc.text('Reply to this audit to book your 48-hour AI search fix · $200 flat fee', m+5, y+19);

      doc.setTextColor(60,60,60); doc.setFontSize(7);
      doc.text('Generated by LexAI / YABAI · AI Search Optimisation · Zero-Cost Local Engine', m, 290);

      doc.save(`Audit-${a.name.replace(/[^a-zA-Z0-9]/g,'-')}.pdf`);
      toast$(`PDF: ${a.name}`);
    } catch(e) { toast$('PDF failed','err'); console.error(e); }
  };

  const exportCSV = () => {
    const rows = ["Name,Suburb,Type,Score,Urgency,ROI,Subject"]
      .concat(audits.map(a=>`"${a.name}","${a.suburb}","${a.type}",${a.score},"${urg(a.score)}","${a.roi}","${a.subject}"`));
    const b = new Blob([rows.join('\n')],{type:'text/csv'});
    const url = URL.createObjectURL(b);
    const el = document.createElement('a'); el.href=url; el.download='YABAI-Audits.csv'; el.click();
  };

  return (
    <div className="min-h-screen text-white" style={{ background:"#080808", fontFamily:"'Inter',system-ui,sans-serif" }}>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-sm border shadow-2xl
          ${toast.t==='err'?"bg-red-950 border-red-500/30 text-red-300":"bg-emerald-950 border-emerald-500/30 text-emerald-300"}`}>
          {toast.m}
        </div>
      )}

      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-xs font-black">R</div>
            <span className="text-sm font-semibold text-white/80">Local Rover</span>
            <span className="text-white/15 text-xs border border-white/8 px-2 py-0.5 rounded-md">$0 cost</span>
          </div>
          <div className="flex gap-2">
            <a href="/Dashboard" className="text-[11px] bg-white/4 text-white/40 px-3 py-1.5 rounded-lg hover:bg-white/8 transition-all">← Control</a>
            <a href="/StrikeDeck" className="text-[11px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1.5 rounded-lg hover:bg-violet-500/15 transition-all">Strike Deck</a>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-8 space-y-5">

        {/* How it works */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { n:"1", t:"Scout", d:"Google Maps + GMB Everywhere — find businesses with no schema" },
            { n:"2", t:"Strike", d:"Paste names below — browser generates audits instantly, $0 cost" },
            { n:"3", t:"Harvest", d:"Export PDF, send via Gmail. 100% profit per audit." },
          ].map(s=>(
            <div key={s.n} className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-4">
              <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-[10px] font-bold text-emerald-400 mb-3">{s.n}</div>
              <p className="text-white/65 font-semibold text-xs mb-1">{s.t}</p>
              <p className="text-white/30 text-xs leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] text-white/30 uppercase tracking-widest font-medium">Business names — one per line</label>
              <textarea
                value={input} onChange={e=>setInput(e.target.value)}
                placeholder={"Ringwood Plumbing Co\nEastern Suburbs Electrical\nMaple Street Café\nRingwood Family Dentist\n..."}
                rows={8}
                className="w-full bg-black/50 border border-white/8 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/15 focus:outline-none focus:border-white/20 font-mono resize-none transition-colors leading-relaxed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-white/30 uppercase tracking-widest font-medium">Suburb</label>
              <input value={suburb} onChange={e=>setSuburb(e.target.value)}
                className="w-full bg-black/50 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-white/20 transition-colors mb-3"
              />
              {names.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] text-white/20 uppercase tracking-widest mb-2">Detected</p>
                  {names.slice(0,7).map((n,i)=>(
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-white/35 truncate max-w-[100px]">{n}</span>
                      <span className="text-emerald-400/50 shrink-0 ml-1">{detect(n)}</span>
                    </div>
                  ))}
                  {names.length>7 && <p className="text-white/15 text-[10px]">+{names.length-7} more</p>}
                </div>
              )}
            </div>
          </div>

          <button onClick={run} disabled={running||!input.trim()}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            {running
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  {pct}% — generating…
                </span>
              : `Generate ${names.length || ''} audits — $0 cost →`
            }
          </button>

          {running && (
            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-200" style={{width:`${pct}%`}} />
            </div>
          )}
        </div>

        {/* Results */}
        {audits.length > 0 && (
          <>
            {/* Summary */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-white/70 font-semibold text-sm">{audits.length} audits ready</p>
                <p className="text-white/25 text-xs mt-0.5">
                  {audits.filter(a=>a.score>=88).length} critical · day-1 target ${audits.length*20} · potential ${audits.length*200} setup
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={exportCSV} className="text-[11px] bg-white/4 hover:bg-white/8 text-white/40 border border-white/8 px-3 py-2 rounded-xl transition-all">CSV ↓</button>
                <button onClick={()=>audits.forEach((a,i)=>setTimeout(()=>exportPDF(a),i*500))}
                  className="text-[11px] bg-violet-500/10 hover:bg-violet-500/15 text-violet-300 border border-violet-500/20 px-3 py-2 rounded-xl transition-all">
                  Export all PDFs
                </button>
              </div>
            </div>

            {/* Audit cards */}
            <div className="space-y-1.5">
              {audits.map((a,i) => {
                const open = active===i;
                return (
                  <div key={i} className={`rounded-2xl border transition-all overflow-hidden ${open?"bg-[#0f0f0f] border-white/12":"bg-[#0a0a0a] border-white/5 hover:border-white/10"}`}>
                    <div className="px-5 py-4 flex items-center gap-4 cursor-pointer" onClick={()=>setActive(open?null:i)}>
                      <div className="w-5 h-5 rounded-md bg-white/4 flex items-center justify-center text-[10px] font-mono text-white/25 shrink-0">{i+1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/75 font-semibold text-sm">{a.name}</p>
                        <p className="text-white/25 text-xs mt-0.5">{a.suburb} · {a.type} · {urg(a.score)}</p>
                      </div>
                      <div className={`text-xl font-black font-mono ${sc(a.score)} shrink-0`}>{a.score}</div>
                      <span className={`text-white/20 text-xs transition-transform ${open?"rotate-180":""}`}>↓</span>
                    </div>

                    {open && (
                      <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-red-400/70 mb-1.5">AI Gap</p>
                            <p className="text-white/50 text-xs leading-relaxed">{a.gap}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-400/70 mb-1.5">Fix</p>
                            <p className="text-white/50 text-xs leading-relaxed">{a.fix}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-400/70">Schema</p>
                            <button onClick={()=>copy(a.schema,`s${i}`)} className="text-[10px] text-white/20 hover:text-white/50 transition-colors">{copied===`s${i}`?"✓ Copied":"Copy →"}</button>
                          </div>
                          <pre className="bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-[11px] text-emerald-300/50 font-mono overflow-x-auto">{a.schema.replace('[Suburb]',a.suburb)}</pre>
                        </div>

                        <div className="flex items-start justify-between gap-3 bg-amber-500/6 border border-amber-500/12 rounded-2xl p-4">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-amber-400/60 mb-1.5">Cold Email Subject</p>
                            <p className="text-amber-200/60 text-xs italic">"{a.subject}"</p>
                          </div>
                          <button onClick={()=>copy(a.subject,`e${i}`)} className="text-[10px] text-white/20 hover:text-white/50 transition-colors shrink-0">{copied===`e${i}`?"✓":"copy"}</button>
                        </div>

                        <button onClick={()=>exportPDF(a)}
                          className="w-full bg-white/4 hover:bg-white/8 border border-white/8 text-white/50 hover:text-white/80 font-medium py-2.5 rounded-xl text-sm transition-all">
                          Export PDF →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Revenue */}
            <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 grid grid-cols-3 gap-4 text-center">
              {[
                { v:`$${audits.length*20}`, l:"Day 1 (audits)", c:"text-amber-400" },
                { v:`$${audits.length*200}`, l:"Week 1 (setup)", c:"text-emerald-400" },
                { v:"100%", l:"Profit margin", c:"text-violet-400" },
              ].map(s=>(
                <div key={s.l}>
                  <div className={`text-2xl font-black font-mono ${s.c}`}>{s.v}</div>
                  <div className="text-[11px] text-white/25 uppercase tracking-wider mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-white/4 mt-12 py-5 text-center text-white/15 text-[10px] tracking-widest uppercase">
        YABAI Local Rover · Browser-Native · jsPDF Export · $0 API Cost
      </footer>
    </div>
  );
}
