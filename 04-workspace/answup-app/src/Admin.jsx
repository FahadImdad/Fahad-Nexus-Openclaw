import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Messages from "./Messages.jsx";

const ease = [0.22, 0.61, 0.36, 1];

// The pipeline columns, in order
const COLUMNS = [
  { key: "pending_review", label: "New", hint: "Just signed up", color: "#4f7cff" },
  { key: "building", label: "Building", hint: "Setting up agent", color: "#9b5cff" },
  { key: "live", label: "Live", hint: "Answering calls", color: "#18b26b" },
  { key: "paused", label: "Paused", hint: "On hold / churned", color: "#94a0bd" },
  { key: "rejected", label: "Rejected", hint: "Not a fit", color: "#ff5c7a" },
];

const planName = { "after-hours": "After-Hours $397", "always-on": "Always-On $697", growth: "Growth $1,197" };
const nextStatus = { pending_review: "building", building: "live", live: "paused" };
const nextLabel = { pending_review: "Accept → Building", building: "Set Live", live: "Pause" };

// What YOU do next for this client — computed from their actual state,
// shown on every card and at the top of the drawer. Kills the guesswork.
const nextStep = (c) => {
  const s = c.status || "pending_review";
  if (s === "rejected") return { n: "Closed", t: "Rejected. Restore if that was a mistake.", ok: false };
  if (s === "paused") return { n: "On hold", t: "Paused. Reactivate when they're ready.", ok: false };
  if (s === "live") return { n: "Live ✓", t: "Answering calls. Nothing to do here.", ok: true };
  // Everything before "live":
  if (!c.vapi_assistant_id)
    return { n: "Action needed", t: "Their AI didn't auto-build. Click \"Build their AI now\" below.", ok: false };
  if (!c.paid)
    return { n: "Waiting on them", t: "AI is built. They're testing it. When they pay, tick \"Paid\" below — nothing to do until then.", ok: true };
  return { n: "Ready to launch", t: "Paid ✓ Now click \"Set Live\" and give them their phone number.", ok: false };
};

export default function Admin() {
  const [clients, setClients] = useState(null);
  const [open, setOpen] = useState(null); // client being edited in the drawer
  const [saving, setSaving] = useState(false);

  const load = () =>
    supabase.from("clients").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setClients(data || []));
  useEffect(() => { load(); }, []);

  const patch = async (id, fields) => {
    setClients((cs) => cs.map((c) => (c.id === id ? { ...c, ...fields } : c)));
    if (open?.id === id) setOpen((o) => ({ ...o, ...fields }));
    const { error } = await supabase.from("clients").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { alert("Save failed: " + error.message); load(); }
  };

  // one click builds this client's Vapi assistant via the automation endpoint
  const autoBuild = async (c) => {
    const { data: s } = await supabase.auth.getSession();
    const t = s?.session?.access_token;
    if (!t) return alert("No session — sign in again.");
    const r = await fetch("/api/autobuild", {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: c.id }),
    });
    const j = await r.json().catch(() => ({}));
    if (j.ok) {
      setClients((cs) => cs.map((x) => (x.id === c.id ? { ...x, vapi_assistant_id: j.assistantId } : x)));
      if (open?.id === c.id) setOpen((o) => ({ ...o, vapi_assistant_id: j.assistantId }));
      alert(j.existing ? "Already built — assistant is attached." : "Done! Their AI receptionist is built and wired. They can test-call it from their dashboard now.");
    } else alert("Auto-build failed: " + (j.reason || j.error || "unknown"));
  };

  const saveDrawer = async () => {
    if (!open) return;
    setSaving(true);
    await supabase.from("clients").update({
      business_name: open.business_name, phone: open.phone, trade: open.trade,
      city: open.city, state: open.state, service_area: open.service_area,
      plan: open.plan, amount: open.amount, admin_notes: open.admin_notes,
      lead_sms: open.lead_sms || null,
      vapi_assistant_id: open.vapi_assistant_id || null,
      answup_number: open.answup_number || null,
      updated_at: new Date().toISOString(),
    }).eq("id", open.id);
    setClients((cs) => cs.map((c) => (c.id === open.id ? { ...c, ...open } : c)));
    setSaving(false);
    setOpen(null);
  };

  const addInvoice = async () => {
    if (!open) return;
    const amount = prompt("Invoice amount (e.g. $697.00):", open.amount || "$697.00");
    if (!amount) return;
    const invoice_no = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const { error } = await supabase.from("invoices").insert({ client_id: open.id, invoice_no, amount, status: "pending" });
    alert(error ? "Failed: " + error.message : `Invoice ${invoice_no} created (pending). Client sees it in Billing.`);
  };

  if (!clients) return <div className="ad-loading">Loading your clients…</div>;

  const counts = COLUMNS.map((col) => clients.filter((c) => (c.status || "pending_review") === col.key).length);
  const total = clients.length;
  const paidCount = clients.filter((c) => c.paid).length;
  const liveCount = clients.filter((c) => c.status === "live").length;

  return (
    <div className="ad">
      <div className="ad-top">
        <div />
        <div className="ad-kpis">
          <div className="ad-kpi"><b>{total}</b><small>Total clients</small></div>
          <div className="ad-kpi"><b>{liveCount}</b><small>Live</small></div>
          <div className="ad-kpi"><b>{paidCount}</b><small>Paid</small></div>
        </div>
      </div>

      <div className="ad-board">
        {COLUMNS.map((col, ci) => {
          const items = clients.filter((c) => (c.status || "pending_review") === col.key);
          return (
            <div className="ad-col" key={col.key}>
              <div className="ad-col-head">
                <span className="ad-dot" style={{ background: col.color }} />
                <b>{col.label}</b>
                <span className="ad-count">{counts[ci]}</span>
              </div>
              <div className="ad-col-hint">{col.hint}</div>
              <div className="ad-cards">
                {items.length === 0 && <div className="ad-empty">Nothing here yet</div>}
                {items.map((c) => (
                  <motion.div
                    layout key={c.id} className="ad-card" onClick={() => setOpen(c)}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}
                  >
                    <div className="ad-card-top">
                      <b>{c.business_name || "(no name)"}</b>
                      {c.paid ? <span className="ad-paid">PAID</span> : <span className="ad-unpaid">unpaid</span>}
                    </div>
                    <small className="ad-card-sub">{c.trade || "—"} · {c.city || "—"}{c.state ? ", " + c.state : ""}</small>
                    <small className="ad-card-sub">{planName[c.plan] || c.plan || "no plan"}</small>
                    <div className={`ad-next-mini ${nextStep(c).ok ? "ok" : ""}`}>→ {nextStep(c).t}</div>
                    <div className="ad-card-actions" onClick={(e) => e.stopPropagation()}>
                      {nextStatus[c.status || "pending_review"] && (
                        c.status === "building" && !c.paid ? (
                          <button className="ad-btn" disabled style={{ opacity: 0.55, cursor: "not-allowed" }}
                            title="Payment gate: create the invoice, receive payment, tick 'Client has paid' in the drawer — then Set Live unlocks.">
                            🔒 Set Live · awaiting payment
                          </button>
                        ) : (
                          <button className="ad-btn go" onClick={() => patch(c.id, { status: nextStatus[c.status || "pending_review"] })}>
                            {nextLabel[c.status || "pending_review"]}
                          </button>
                        )
                      )}
                      {(c.status || "pending_review") === "pending_review" && (
                        <button className="ad-btn rej" onClick={() => patch(c.id, { status: "rejected" })}>Reject</button>
                      )}
                      {c.status === "rejected" && (
                        <button className="ad-btn" onClick={() => patch(c.id, { status: "pending_review" })}>Restore</button>
                      )}
                      {c.status === "paused" && (
                        <button className="ad-btn go" onClick={() => patch(c.id, { status: "live" })}>Reactivate</button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Client detail drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="ad-scrim" onClick={() => setOpen(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div className="ad-drawer" initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={{ duration: 0.35, ease }}>
              <div className="ad-drawer-head">
                <h2>{open.business_name || "Client"}</h2>
                <button className="ad-x" onClick={() => setOpen(null)}>×</button>
              </div>
              <div className="ad-drawer-body">
                <div className={`ad-next ${nextStep(open).ok ? "ok" : ""}`}>
                  <b>{nextStep(open).n}</b>
                  <span>{nextStep(open).t}</span>
                </div>
                <div className="ad-field"><label>Business name</label><input value={open.business_name || ""} onChange={(e) => setOpen({ ...open, business_name: e.target.value })} /></div>
                <div className="ad-two">
                  <div className="ad-field"><label>Trade</label><input value={open.trade || ""} onChange={(e) => setOpen({ ...open, trade: e.target.value })} /></div>
                  <div className="ad-field"><label>Business phone</label><input value={open.phone || ""} onChange={(e) => setOpen({ ...open, phone: e.target.value })} /></div>
                </div>
                <div className="ad-field"><label>📱 Text new leads to this number</label>
                  <input value={open.lead_sms || ""} placeholder="Owner's mobile — gets an SMS after every call" onChange={(e) => setOpen({ ...open, lead_sms: e.target.value })} /></div>
                <div className="ad-two">
                  <div className="ad-field"><label>City</label><input value={open.city || ""} onChange={(e) => setOpen({ ...open, city: e.target.value })} /></div>
                  <div className="ad-field"><label>State</label><input value={open.state || ""} onChange={(e) => setOpen({ ...open, state: e.target.value })} /></div>
                </div>
                <div className="ad-field"><label>Service area</label><input value={open.service_area || ""} onChange={(e) => setOpen({ ...open, service_area: e.target.value })} /></div>
                <div className="ad-field"><label>Email</label><input value={open.email || ""} disabled /></div>

                <div className="ad-sep">Billing</div>
                <div className="ad-two">
                  <div className="ad-field"><label>Plan</label>
                    <select value={open.plan || "always-on"} onChange={(e) => setOpen({ ...open, plan: e.target.value })}>
                      <option value="after-hours">After-Hours $397</option>
                      <option value="always-on">Always-On $697</option>
                      <option value="growth">Growth $1,197</option>
                    </select>
                  </div>
                  <div className="ad-field"><label>Monthly amount</label><input value={open.amount || ""} placeholder="$697" onChange={(e) => setOpen({ ...open, amount: e.target.value })} /></div>
                </div>
                <label className="ad-check">
                  <input type="checkbox" checked={!!open.paid} onChange={(e) => patch(open.id, { paid: e.target.checked })} />
                  <span>Client has paid this month</span>
                </label>
                <button className="ad-btn" style={{ width: "100%", marginTop: 10, padding: "10px" }} onClick={addInvoice}>＋ Create invoice for this client</button>

                <div className="ad-sep">Their AI receptionist</div>
                {open.vapi_assistant_id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13.5, color: "#18b26b", fontWeight: 600 }}>
                    ✓ Built and ready. The client can test-call it from their dashboard.
                  </div>
                ) : (
                  <button className="ad-btn go" style={{ width: "100%", marginBottom: 10, padding: "10px" }} onClick={() => autoBuild(open)}>
                    ⚙ Build their AI now (one click)
                  </button>
                )}
                <div className="ad-field"><label>Their phone number (only needed at go-live)</label>
                  <input value={open.answup_number || ""} placeholder="Add when you set them live" onChange={(e) => setOpen({ ...open, answup_number: e.target.value })} /></div>
                <details style={{ marginTop: 4 }}>
                  <summary style={{ fontSize: 12, color: "var(--muted)", cursor: "pointer" }}>Advanced: assistant ID</summary>
                  <div className="ad-field" style={{ marginTop: 6 }}>
                    <input value={open.vapi_assistant_id || ""} placeholder="auto-filled when the AI is built" onChange={(e) => setOpen({ ...open, vapi_assistant_id: e.target.value })} /></div>
                </details>

                <div className="ad-sep">💬 Chat with this client</div>
                <Messages clientId={open.id} me="admin" compact />

                <div className="ad-sep">Private admin notes</div>
                <textarea className="ad-notes" rows={5} value={open.admin_notes || ""} placeholder="Called them Mon, agent built, waiting on first invoice…" onChange={(e) => setOpen({ ...open, admin_notes: e.target.value })} />

                <div className="ad-status-row">
                  <span>Status</span>
                  <select value={open.status || "pending_review"} onChange={(e) => patch(open.id, { status: e.target.value })}>
                    {COLUMNS.map((col) => <option key={col.key} value={col.key}>{col.label}</option>)}
                  </select>
                </div>

                <button className="ad-btn rej" style={{ width: "100%", marginTop: 16, padding: "10px" }}
                  onClick={async () => {
                    if (!window.confirm(`PERMANENTLY delete ${open.business_name || "this client"}? This wipes their calls, messages, invoices, AI assistant, and login. Cannot be undone.`)) return;
                    const { data: s } = await supabase.auth.getSession();
                    const t = s?.session?.access_token;
                    const r = await fetch("/api/admin-client", {
                      method: "POST",
                      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "delete", clientId: open.id }),
                    });
                    const j = await r.json().catch(() => ({}));
                    if (j.ok) { alert("Client fully removed."); setOpen(null); load(); }
                    else alert("Delete failed: " + (j.error || "unknown"));
                  }}>
                  🗑 Delete client permanently
                </button>
              </div>
              <div className="ad-drawer-foot">
                <button className="ad-cancel" onClick={() => setOpen(null)}>Close</button>
                <button className="ad-save" onClick={saveDrawer} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
