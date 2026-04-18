import { useState } from "react";

const KEY = "BASHAM2026";

const FIRMS = [
  { n:"Blackburn Law Group",       s:"Blackburn",     t:"Corporate & M&A",        sc:95, h:15, c:7200,  g:"Due diligence is 100% manual — no AI extraction of risk clauses across 500-page document bundles.", e:"Your competitors in the CBD already fixed this. I've got the data — can I send it through?" },
  { n:"Eastfield Law",             s:"Croydon",       t:"Commercial Litigation",   sc:94, h:12, c:5760,  g:"Junior lawyers spending 12+ hours per case doing discovery searches across document dumps.", e:"I found the exact bottleneck costing you $5,760/mo — takes 2 mins to read the summary." },
  { n:"Collins Street Barristers", s:"Melbourne CBD", t:"Commercial Arbitration",  sc:93, h:13, c:6240,  g:"Barristers manually extracting key findings from arbitration awards — no AI synthesis layer.", e:"13hrs/week building submissions that AI can draft in 15 minutes. Worth a look?" },
  { n:"Maroondah Lawyers",         s:"Ringwood",      t:"Conveyancing",            sc:91, h:8,  c:3840,  g:"Staff manually cross-checking title searches against council overlays — missing risk flags.", e:"8hrs/week on title searches AI resolves in 60 seconds." },
  { n:"Fitzroy Street Legal",      s:"St Kilda",      t:"Criminal Defence",        sc:90, h:11, c:5280,  g:"Solicitors manually reviewing police brief materials — no AI inconsistency detection.", e:"AI found 3 inconsistencies in a 200-page brief in 90 seconds. Interested?" },
  { n:"Box Hill Community Legal",  s:"Box Hill",      t:"Immigration",             sc:89, h:10, c:4800,  g:"Caseworkers manually searching VCAT and AAT decisions for precedents — 4+ hours per matter.", e:"10hrs/week on precedent research — what if it took 30 seconds?" },
  { n:"Ringwood Legal",            s:"Ringwood",      t:"Family Law",              sc:88, h:6,  c:2880,  g:"Manually reviewing 40-page parenting agreements instead of AI-flagging conflict clauses.", e:"Your family law team spends 6hrs/week on work AI can do in 4 minutes." },
  { n:"Doncaster Legal Partners",  s:"Doncaster",     t:"Employment Law",          sc:87, h:7,  c:3360,  g:"Every HR advisory matter requires manual review of Fair Work Act sections.", e:"Employment law research that takes 7hrs — AI does it in 8 minutes." },
  { n:"Warrandyte Law",            s:"Warrandyte",    t:"Planning & Environment",  sc:86, h:9,  c:4320,  g:"Lawyers manually interpreting 200-page planning scheme amendments for each client matter.", e:"Planning scheme amendments are costing you 9hrs every week. I can show you why." },
  { n:"Springvale Community Law",  s:"Springvale",    t:"Tenancy & Consumer",      sc:85, h:7,  c:3360,  g:"VCAT hearing preparation entirely manual — no AI pre-screening of tribunal precedents.", e:"What if you knew the VCAT outcome before filing? We can show you." },
  { n:"Camberwell Legal Centre",   s:"Camberwell",    t:"Personal Injury",         sc:83, h:8,  c:3840,  g:"Medical report analysis done manually — no structured extraction for PI claims.", e:"Your PI team manually reads every medical report. There is a better way." },
  { n:"Kew Law Chambers",          s:"Kew",           t:"Tax & Revenue",           sc:82, h:6,  c:2880,  g:"ATO private ruling research done manually — no intelligent mapping to relevant decisions.", e:"6hrs/week on ATO ruling research that AI does in under 3 minutes." },
  { n:"Richmond Legal Group",      s:"Richmond",      t:"IP & Technology",         sc:80, h:5,  c:2400,  g:"IP attorneys manually monitoring trademark databases for infringement risks.", e:"Your clients IP is at risk — and your team finds out 3 months late." },
  { n:"Healesville Legal Group",   s:"Healesville",   t:"Wills & Estates",         sc:79, h:5,  c:2400,  g:"Estate paralegals manually comparing testamentary documents across multiple versions.", e:"A 5-minute audit reveals $2,400/mo in paralegal bottlenecks." },
];

var totalC = 0; for (var i=0; i<FIRMS.length; i++) { totalC += FIRMS[i].c; }
var totalH = 0; for (var j=0; j<FIRMS.length; j++) { totalH += FIRMS[j].h; }

function fmt(n) { return "$" + n.toLocaleString(); }
function col(s) { return s>=90?"#f87171":s>=80?"#fb923c":"#fbbf24"; }

export default function PartnerView() {
  var p = typeof window!=="undefined" ? new URLSearchParams(window.location.search) : { get: function(){return null;} };
  var auto = p.get("key") === KEY;
  var S = useState(auto); var unlocked=S[0]; var setUnlocked=S[1];
  var I = useState(""); var input=I[0]; var setInput=I[1];
  var E = useState(false); var err=E[0]; var setErr=E[1];
  var O = useState(null); var open=O[0]; var setOpen=O[1];
  var C = useState(null); var copied=C[0]; var setCopied=C[1];

  function tryKey() {
    if (input.trim().toUpperCase()===KEY) { setUnlocked(true); }
    else { setErr(true); setTimeout(function(){setErr(false);},2000); }
  }

  function cp(txt,i) {
    try{navigator.clipboard.writeText(txt);}catch(e){}
    setCopied(i); setTimeout(function(){setCopied(null);},2000);
  }

  if (!unlocked) return (
    <div style={{minHeight:"100vh",background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{textAlign:"center",padding:32}}>
        <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg,#8b5cf6,#d946ef)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:22,color:"#fff",margin:"0 auto 16px"}}>Y</div>
        <h2 style={{fontSize:18,fontWeight:800,color:"#ccc",margin:"0 0 6px"}}>YABAI Partner Portal</h2>
        <p style={{fontSize:13,color:"#555",margin:"0 0 24px"}}>Enter your access key</p>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}>
          <input value={input} onChange={function(e){setInput(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")tryKey();}}
            placeholder="Access key..." style={{background:"#111",border:"1px solid "+(err?"#7a2020":"#2a2a2a"),color:"#ccc",borderRadius:10,padding:"10px 14px",fontSize:14,width:160,outline:"none"}}/>
          <button onClick={tryKey} style={{background:"#1a0f2e",border:"1px solid #5b21b6",color:"#a78bfa",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Enter</button>
        </div>
        {err&&<p style={{fontSize:12,color:"#f87171",marginTop:10}}>Invalid key</p>}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#080808",color:"#fff",fontFamily:"system-ui,sans-serif"}}>

      <div style={{borderBottom:"1px solid #181818",background:"#050505",position:"sticky",top:0,zIndex:9,padding:"0 20px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:24,height:24,borderRadius:6,background:"linear-gradient(135deg,#8b5cf6,#d946ef)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,color:"#fff"}}>Y</div>
          <span style={{fontSize:13,fontWeight:700,color:"#ccc"}}>YABAI</span>
          <span style={{color:"#333",margin:"0 3px"}}>/</span>
          <span style={{fontSize:12,color:"#555"}}>Partner View</span>
        </div>
        <span style={{fontSize:11,color:"#34d399",background:"#0a1f14",border:"1px solid #1a3a24",padding:"3px 10px",borderRadius:7}}>VIP Access</span>
      </div>

      <div style={{maxWidth:820,margin:"0 auto",padding:"32px 20px 60px"}}>
        <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"#333",margin:"0 0 6px"}}>YABAI · Capital Colony · Melbourne Legal</p>
        <h1 style={{fontSize:24,fontWeight:900,color:"#eee",margin:"0 0 10px",lineHeight:1.3}}>The Melbourne Law Firm Pipeline</h1>
        <p style={{fontSize:14,color:"#555",margin:"0 0 28px",lineHeight:1.75,maxWidth:560}}>
          14 Melbourne law firms. The AI ran the route overnight and found every one of them losing money through manual processes that can be fixed in 48 hours.
        </p>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:24}}>
          {[
            {v:"14",l:"Firms Audited",c:"#a78bfa"},
            {v:totalH+"hrs",l:"Wasted/Week",c:"#f87171"},
            {v:fmt(totalC),l:"Lost/Month",c:"#34d399"},
            {v:"$58,560",l:"Recoverable MRR",c:"#fbbf24"},
          ].map(function(s){return(
            <div key={s.l} style={{background:"#0d0d0d",border:"1px solid #1c1c1c",borderRadius:12,padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:900,fontFamily:"monospace",color:s.c}}>{s.v}</div>
              <div style={{fontSize:10,color:"#555",marginTop:4}}>{s.l}</div>
            </div>
          );})}
        </div>

        <p style={{fontSize:12,fontWeight:600,color:"#444",margin:"0 0 10px"}}>14 targets — sorted by opportunity score</p>

        {FIRMS.map(function(a,i){
          var isOpen=open===i;
          return(
            <div key={i} style={{background:isOpen?"#0d0d0d":"#080808",border:"1px solid "+(isOpen?"#2a2a2a":"#141414"),borderRadius:12,marginBottom:5,overflow:"hidden"}}>
              <div onClick={function(){setOpen(isOpen?null:i);}} style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                <span style={{fontSize:10,fontFamily:"monospace",color:"#333",width:18,flexShrink:0}}>{i<9?"0"+(i+1):(i+1)}</span>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:600,color:"#ccc",margin:0}}>{a.n}</p>
                  <p style={{fontSize:11,color:"#444",margin:"2px 0 0"}}>{a.s} · {a.t} · {a.h}h/wk · {fmt(a.c)}/mo lost</p>
                </div>
                <span style={{fontSize:20,fontWeight:900,fontFamily:"monospace",color:col(a.sc),flexShrink:0}}>{a.sc}</span>
                <span style={{color:"#333",fontSize:10,flexShrink:0}}>{isOpen?"▲":"▼"}</span>
              </div>

              {isOpen&&(
                <div style={{padding:"0 16px 16px",borderTop:"1px solid #141414"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,paddingTop:12,marginBottom:10}}>
                    <div style={{background:"#120808",border:"1px solid #2a1010",borderRadius:8,padding:10}}>
                      <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#7a3030",margin:"0 0 6px"}}>The Gap</p>
                      <p style={{fontSize:12,color:"#777",margin:0,lineHeight:1.6}}>{a.g}</p>
                    </div>
                    <div style={{background:"#081208",border:"1px solid #102a10",borderRadius:8,padding:10}}>
                      <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#2a6a2a",margin:"0 0 6px"}}>Monthly Cost to Them</p>
                      <p style={{fontSize:24,fontWeight:900,fontFamily:"monospace",color:"#34d399",margin:"0 0 2px"}}>{fmt(a.c)}</p>
                      <p style={{fontSize:11,color:"#444",margin:0}}>{a.h}hrs x $120/hr</p>
                    </div>
                  </div>
                  <div style={{background:"#121008",border:"1px solid #2a2208",borderRadius:8,padding:10,marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6a5020",margin:0}}>Your opener</p>
                      <button onClick={function(e){e.stopPropagation();cp(a.e,i);}} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#666",borderRadius:6,padding:"3px 10px",fontSize:11,cursor:"pointer"}}>
                        {copied===i?"Copied":"Copy"}
                      </button>
                    </div>
                    <p style={{fontSize:13,color:"#888",margin:0,fontStyle:"italic",lineHeight:1.65}}>"{a.e}"</p>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                    {[{l:"Audit",v:"$97",s:"One-time"},{l:"Implementation",v:"$1,500",s:"48hr flat fee"},{l:"Their ROI",v:fmt(a.c),s:"Per month saved"}].map(function(s){return(
                      <div key={s.l} style={{background:"#0a0a0a",border:"1px solid #181818",borderRadius:8,padding:"10px",textAlign:"center"}}>
                        <div style={{fontSize:16,fontWeight:900,fontFamily:"monospace",color:"#bbb"}}>{s.v}</div>
                        <div style={{fontSize:10,color:"#444",marginTop:3}}>{s.l}</div>
                        <div style={{fontSize:10,color:"#333",marginTop:2}}>{s.s}</div>
                      </div>
                    );})}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{borderTop:"1px solid #111",padding:"18px 0",textAlign:"center",fontSize:10,color:"#2a2a2a",letterSpacing:"0.12em",textTransform:"uppercase"}}>
        YABAI · Capital Colony · Melbourne Legal · Partner View
      </div>
    </div>
  );
}
