import { useState, useEffect } from "react";
import { getPaymentStatus } from "@/api/entities";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useSearchParams, NavLink } from "react-router-dom";
import logger from "@/utils/logger";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState(null);
  const [polling, setPolling] = useState(true);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!sessionId || !polling) return;
    const poll = async () => {
      try {
        const data = await getPaymentStatus(sessionId);
        setStatus(data);
        if (data.payment_status === "paid" || data.status === "expired" || attempts >= 5) {
          setPolling(false);
        } else {
          setAttempts((a) => a + 1);
        }
      } catch (e) {
        logger.warn("Payment status check failed", e);
        if (attempts >= 5) setPolling(false);
        setAttempts((a) => a + 1);
      }
    };
    const timer = setTimeout(poll, attempts === 0 ? 500 : 2000);
    return () => clearTimeout(timer);
  }, [sessionId, polling, attempts]);

  const isPaid = status?.payment_status === "paid";
  const amount = status?.amount_total ? (status.amount_total / 100).toFixed(2) : "0";

  return (
    <div data-testid="payment-success-page" className="max-w-lg mx-auto px-4 py-20 text-center">
      {!status && polling && (
        <div>
          <Loader2 size={40} className="mx-auto mb-4 animate-spin" style={{ color: "var(--yb-gold)" }} />
          <p className="text-lg font-bold" style={{ color: "var(--yb-text-primary)" }}>Verifying payment...</p>
          <p className="text-xs mt-2" style={{ color: "var(--yb-text-muted)" }}>Checking with Stripe...</p>
        </div>
      )}

      {isPaid && (
        <div>
          <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: "#22c55e" }} />
          <h1 className="text-2xl font-black mb-2" style={{ color: "#22c55e" }}>Payment Successful</h1>
          <p className="text-lg font-mono font-bold mb-4" style={{ color: "var(--yb-gold)" }}>
            ${amount} AUD
          </p>
          <div className="rounded-sm p-4 mb-6 text-left" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--yb-gold)" }}>Revenue Split Applied</p>
            <div className="flex justify-between py-1.5" style={{ borderBottom: "1px solid var(--yb-border)" }}>
              <span className="text-xs" style={{ color: "var(--yb-text-muted)" }}>Your cut (95%)</span>
              <span className="text-xs font-bold font-mono" style={{ color: "#22c55e" }}>${(amount * 0.95).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-xs" style={{ color: "var(--yb-text-muted)" }}>Reinvestment Vault (5%)</span>
              <span className="text-xs font-bold font-mono" style={{ color: "var(--yb-gold)" }}>${(amount * 0.05).toFixed(2)}</span>
            </div>
          </div>
          <NavLink to="/control-room" className="inline-block text-sm font-bold px-6 py-3 rounded-sm" style={{ background: "var(--yb-gold)", color: "#000" }}>
            Back to Control Room
          </NavLink>
        </div>
      )}

      {status && !isPaid && !polling && (
        <div>
          <XCircle size={48} className="mx-auto mb-4" style={{ color: "#ef4444" }} />
          <h1 className="text-xl font-black mb-2" style={{ color: "#ef4444" }}>Payment Not Completed</h1>
          <p className="text-sm mb-4" style={{ color: "var(--yb-text-muted)" }}>Status: {status.status || "unknown"}</p>
          <NavLink to="/control-room" className="inline-block text-sm font-bold px-6 py-3 rounded-sm" style={{ background: "rgba(255,255,255,0.08)", color: "var(--yb-text-primary)", border: "1px solid var(--yb-border)" }}>
            Try Again
          </NavLink>
        </div>
      )}
    </div>
  );
}
