import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MessageSquare, Send, Bot } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function YabbaiAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("grok-3");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/yabbai/agent/history`).then((r) => setMessages(r.data || [])).catch((err) => { console.error("Failed to load agent history:", err); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- API constant, only run on mount

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const msg = input;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg, model }]);
    setSending(true);
    try {
      const res = await axios.post(`${API}/yabbai/agent/chat`, { message: msg, model });
      setMessages((m) => [...m, { role: "assistant", content: res.data.reply, model: res.data.model }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Connection error. Retrying...", model }]);
    }
    setSending(false);
  };

  return (
    <div data-testid="agent-page" className="max-w-4xl mx-auto px-4 py-6 flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight" style={{ fontFamily: "'Orbitron', monospace", color: "#F7B731" }}>YABBAI Agent</h1>
          <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>Powered by Grok xAI</p>
        </div>
        <select data-testid="model-select" value={model} onChange={(e) => setModel(e.target.value)}
          className="text-[11px] font-mono px-3 py-1.5 rounded-sm focus:outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(247,183,49,0.2)", color: "#F7B731" }}>
          <option value="grok-3">Grok 3</option>
          <option value="grok-3-mini">Grok 3 Mini</option>
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <Bot size={40} className="mx-auto mb-3" style={{ color: "rgba(247,183,49,0.3)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Ask the YABBAI Agent about missions, tokens, yields, or DeFi strategy.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={m.id || `msg-${i}-${m.role}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[75%] rounded-sm px-4 py-3" style={{
              background: m.role === "user" ? "rgba(0,240,255,0.1)" : "rgba(247,183,49,0.05)",
              border: `1px solid ${m.role === "user" ? "rgba(0,240,255,0.2)" : "rgba(247,183,49,0.1)"}`,
            }}>
              <p className="text-[10px] font-mono mb-1" style={{ color: m.role === "user" ? "#00F0FF" : "#F7B731" }}>
                {m.role === "user" ? "You" : `Agent (${m.model || "grok"})`}
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.8)" }}>{m.content}</p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-sm px-4 py-3" style={{ background: "rgba(247,183,49,0.05)", border: "1px solid rgba(247,183,49,0.1)" }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#F7B731" }} />
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#F7B731", animationDelay: "0.2s" }} />
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#F7B731", animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input data-testid="agent-input" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Ask YABBAI Agent..."
          className="flex-1 rounded-sm px-4 py-3 text-sm focus:outline-none"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(247,183,49,0.2)", color: "#F9FAFB" }} />
        <button data-testid="agent-send" onClick={send} disabled={sending || !input.trim()}
          className="px-4 py-3 rounded-sm transition-all disabled:opacity-30"
          style={{ background: "#F7B731", color: "#050808" }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
