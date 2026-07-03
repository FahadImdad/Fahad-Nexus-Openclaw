import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "./lib/supabase";
import { Logo, ThemeToggle, Equalizer } from "./brand.jsx";
import Admin from "./Admin.jsx";

const ease = [0.22, 0.61, 0.36, 1];
const rise = { hidden: { opacity: 0, y: 22 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.06, ease } }) };

const planLabel = { "after-hours": "After-Hours plan", "always-on": "Always-On plan", growth: "Growth plan" };
const PLAN_MIN = { "after-hours": 500, "always-on": 1000, growth: 2500 };
const URGENCY = {
  emergency: { label: "Emergency", cls: "red", ic: "🚨" },
  new_lead: { label: "New lead", cls: "green", ic: "👤" },
  follow_up: { label: "Follow-up", cls: "", ic: "📞" },
  normal: { label: "Handled", cls: "", ic: "📞" },
};
const u = (c) => URGENCY[c?.urgency] || URGENCY.normal;
const fmtTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : d.toLocaleDateString([], { month: "short", day: "numeric" });
};
const moneyOf = (v) => { const n = parseFloat(String(v || "").replace(/[^0-9.]/g, "")); return isNaN(n) ? 0 : n; };

/* ============ Real data hooks ============ */
function useCalls(client, isAdmin) {
  const [calls, setCalls] = useState(null);
  useEffect(() => {
    if (!isAdmin && !client?.id) { setCalls([]); return; }
    let q = supabase.from("calls").select("*").order("created_at", { ascending: false }).limit(300);
    if (!isAdmin) q = q.eq("client_id", client.id);
    q.then(({ data }) => setCalls(data || []));
  }, [client?.id, isAdmin]);
  return [calls, setCalls];
}

function useInvoices(client, isAdmin) {
  const [inv, setInv] = useState(null);
  useEffect(() => {
    if (!isAdmin && !client?.id) { setInv([]); return; }
    let q = supabase.from("invoices").select("*").order("issued_on", { ascending: false }).limit(24);
    if (!isAdmin) q = q.eq("client_id", client.id);
    q.then(({ data }) => setInv(data || []));
  }, [client?.id, isAdmin]);
  return inv;
}

/* ============ Empty state ============ */
function Empty({ title, hint }) {
  return (
    <div className="dz-empty">
      <div className="dz-empty-ic"><Equalizer bars={5} /></div>
      <b>{title}</b>
      <small>{hint}</small>
    </div>
  );
}

/* ============ Live area chart from real calls ============ */
function AreaChart({ calls }) {
  const days = 30;
  const counts = useMemo(() => {
    const arr = Array(days).fill(0);
    (calls || []).forEach((c) => {
      const diff = Math.floor((Date.now() - new Date(c.created_at)) / 86400000);
      if (diff >= 0 && diff < days) arr[days - 1 - diff]++;
    });
    return arr;
  }, [calls]);
  const max = Math.max(1, ...counts);
  const W = 560, H = 180, P = 8;
  const pts = counts.map((v, i) => [P + (i * (W - P * 2)) / (days - 1), H - P - (v / max) * (H - P * 2 - 14)]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${H - P} L${pts[0][0]},${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 190 }}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--blue)" stopOpacity=".28" />
          <stop offset="100%" stopColor="var(--blue)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={area} fill="url(#areaFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.5 }} />
      <motion.path d={line} fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} />
    </svg>
  );
}

/* ============ OVERVIEW (all real) ============ */
function Overview({ calls, client, isPending, onOpenLead }) {
  if (!calls) return <Empty title="Loading your data…" hint="Fetching live calls from your account." />;
  const totalCalls = calls.length;
  const leads = calls.filter((c) => c.caller_phone).length;
  const revenue = calls.reduce((s, c) => s + moneyOf(c.est_value), 0);
  const minutes = Math.round(calls.reduce((s, c) => s + (c.duration_seconds || 0), 0) / 60);
  const planMin = PLAN_MIN[client?.plan] || 1000;
  const pct = Math.min(100, Math.round((minutes / planMin) * 100));
  const stats = [
    { l: "Total Calls", v: totalCalls.toLocaleString(), ic: "📞", s: "answered by AI" },
    { l: "Leads Captured", v: leads.toLocaleString(), ic: "👤", s: "with contact details" },
    { l: "Est. Job Value", v: `$${revenue.toLocaleString()}`, ic: "💰", s: "from captured leads" },
    { l: "Minutes Used", v: minutes.toLocaleString(), vs: `/${planMin}`, ic: "⏱️", s: `${pct}% of plan`, bar: pct },
  ];
  return (
    <>
      <div className="dz-stats">
        {stats.map((s, i) => (
          <motion.div className="dz-stat" key={s.l} variants={rise} custom={i} initial="hidden" animate="show">
            <div className="dz-stat-top"><span className="dz-stat-l">{s.l}</span><span className="dz-stat-ic">{s.ic}</span></div>
            <div className="dz-stat-v">{s.v}{s.vs && <small>{s.vs}</small>}</div>
            <div className="dz-stat-s">{s.s}</div>
            {s.bar !== undefined && <div className="dz-bar"><motion.i initial={{ width: 0 }} animate={{ width: `${s.bar}%` }} transition={{ duration: 1.1, delay: 0.5, ease }} /></div>}
          </motion.div>
        ))}
      </div>

      <div className="dz-grid">
        <motion.div className="dz-card dz-chart" variants={rise} custom={2} initial="hidden" animate="show">
          <div className="dz-card-head">
            <div><h3>Call volume</h3><span style={{ fontSize: 12.5, color: "var(--muted)" }}>Calls answered, last 30 days</span></div>
            <span className="dz-badge">{totalCalls} total</span>
          </div>
          {totalCalls === 0
            ? <Empty title="No calls yet" hint={isPending ? "Your receptionist is being set up. Calls will appear here the moment it goes live." : "Your receptionist is live. The next call will appear here in real time."} />
            : <AreaChart calls={calls} />}
        </motion.div>

        <motion.div className="dz-card" variants={rise} custom={3} initial="hidden" animate="show">
          <div className="dz-card-head"><h3>Latest activity</h3><span className="dz-badge green">● Live</span></div>
          {totalCalls === 0
            ? <Empty title="Listening for calls…" hint="Every call your AI answers shows up here instantly." />
            : (
              <div className="dz-feed">
                {calls.slice(0, 4).map((c) => (
                  <div className="dz-feed-i" key={c.id}>
                    <div className="dz-feed-ic">{u(c).ic}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="dz-feed-b">{c.caller_name || c.caller_phone || "Caller"} · {c.issue || "Call handled"}</div>
                      <div className="dz-feed-s"><span className={`dz-badge ${u(c).cls}`} style={{ marginRight: 8 }}>{u(c).label}</span>{fmtTime(c.created_at)}</div>
                      {c.summary && <div className="dz-feed-q">"{c.summary.slice(0, 90)}{c.summary.length > 90 ? "…" : ""}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </motion.div>
      </div>

      <motion.div className="dz-card" variants={rise} custom={4} initial="hidden" animate="show">
        <div className="dz-card-head"><h3>Recent leads</h3><span className="dz-badge">Real-time</span></div>
        {leads === 0
          ? <Empty title="No leads yet" hint="As soon as your AI captures a caller's details, the lead lands here with a full transcript." />
          : (
            <div style={{ overflowX: "auto" }}>
              <table className="dz-table">
                <thead><tr><th>Customer</th><th>Issue</th><th>Urgency</th><th>Received</th><th>Est. value</th><th></th></tr></thead>
                <tbody>
                  {calls.filter((c) => c.caller_phone).slice(0, 6).map((c) => (
                    <tr key={c.id}>
                      <td><div className="dz-cust"><b>{c.caller_name || "Unknown"}</b><small>{c.caller_phone}</small></div></td>
                      <td>{c.issue || "—"}</td>
                      <td><span className={`dz-badge ${u(c).cls}`}>{u(c).label}</span></td>
                      <td style={{ color: "var(--muted)" }}>{fmtTime(c.created_at)}</td>
                      <td><b>{c.est_value || "—"}</b></td>
                      <td><span className="dz-act" onClick={() => onOpenLead(c.id)}>Open →</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </motion.div>
    </>
  );
}

/* ============ LEADS (real transcripts) ============ */
function Leads({ calls, setCalls }) {
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (!calls) return <Empty title="Loading…" hint="Fetching your calls." />;
  if (calls.length === 0) {
    return (
      <div className="dz-card">
        <Empty title="No calls captured yet" hint="Once your receptionist answers its first call, the full lead, transcript, and AI summary appear here. Nothing is mocked — this is your live call feed." />
      </div>
    );
  }

  const shown = calls.filter((c) =>
    (filter === "All" || (filter === "Emergency" ? c.urgency === "emergency" : filter === "Leads" ? !!c.caller_phone : true)) &&
    (q === "" || ((c.caller_name || "") + (c.issue || "") + (c.caller_phone || "")).toLowerCase().includes(q.toLowerCase()))
  );
  const lead = calls.find((c) => c.id === sel) || shown[0] || calls[0];
  const transcript = Array.isArray(lead.transcript) ? lead.transcript : [];

  const saveNote = async () => {
    setSaving(true);
    await supabase.from("calls").update({ notes: note }).eq("id", lead.id);
    setCalls((cs) => cs.map((c) => (c.id === lead.id ? { ...c, notes: note } : c)));
    setSaving(false);
  };

  return (
    <div className="lz">
      <motion.div className="lz-col" variants={rise} initial="hidden" animate="show">
        <div className="lz-list-head">
          <input className="lz-search" placeholder="Search calls, names, issues…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="lz-chips">
            {["All", "Emergency", "Leads"].map((f) => (
              <button key={f} className={`lz-chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div className="lz-items">
          {shown.map((c) => (
            <div key={c.id} className={`lz-item ${lead.id === c.id ? "sel" : ""}`} onClick={() => { setSel(c.id); setNote(c.notes || ""); }}>
              <b>{c.caller_name || c.caller_phone || "Caller"}</b>
              <p>{c.issue || c.summary || "Call answered"}</p>
              <div className="lz-item-meta">
                <span className={`dz-badge ${u(c).cls}`}>{u(c).label}</span>
                <span className="lz-time">{fmtTime(c.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div className="lz-col" key={lead.id} variants={rise} custom={1} initial="hidden" animate="show">
        <div className="lz-mid-head">
          <div><h2>{lead.caller_name || lead.caller_phone || "Caller"}</h2><small>{lead.caller_address || "Address not captured"}</small></div>
          <span className={`dz-badge ${u(lead).cls}`}>{u(lead).label}</span>
        </div>
        {lead.summary && <div className="lz-summary">✨ <b>AI Summary</b> — {lead.summary}</div>}
        {lead.recording_url && (
          <div className="lz-wave">
            <button className="lz-wave-play" onClick={() => window.open(lead.recording_url, "_blank")}>▶</button>
            <div className="lz-wave-bars">{Array.from({ length: 28 }).map((_, i) => <i key={i} style={{ height: 8 + ((i * 7) % 19) }} />)}</div>
            <time>{Math.floor((lead.duration_seconds || 0) / 60)}m {(lead.duration_seconds || 0) % 60}s</time>
          </div>
        )}
        <div className="lz-chat">
          {transcript.length === 0 && <Empty title="Transcript processing" hint="The conversation transcript appears here once the call report arrives." />}
          {transcript.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}>
              <div className="lz-who">{m.who === "ai" ? "Answup AI" : (lead.caller_name || "Caller").split(" ")[0]}</div>
              <div className={`bub ${m.who}`} style={{ maxWidth: "88%" }}>{m.t}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="lz-col" variants={rise} custom={2} initial="hidden" animate="show">
        <div className="lz-info">
          <div className="lz-sep">Lead information</div>
          <div className="lz-row"><span>📞 Phone</span><b>{lead.caller_phone || "—"}</b></div>
          <div className="lz-row"><span>📍 Address</span><b style={{ maxWidth: 160 }}>{lead.caller_address || "—"}</b></div>
          <div className="lz-row"><span>🔧 Trade</span><b>{lead.trade || "—"}</b></div>
          <div className="lz-row"><span>💰 Est. value</span><b>{lead.est_value || "—"}</b></div>
          <div className="lz-row"><span>🕐 Received</span><b>{fmtTime(lead.created_at)}</b></div>

          {lead.score != null && (
            <>
              <div className="lz-sep">Lead score</div>
              <div className="lz-score" style={{ "--v": lead.score }}>
                <div className="lz-ring"><b>{lead.score}</b></div>
                <small>{lead.score >= 90 ? "Very high intent. Call back immediately." : lead.score >= 75 ? "High intent, strong job opportunity." : "Warm lead, schedule a follow-up."}</small>
              </div>
            </>
          )}

          <div className="lz-sep">Internal notes</div>
          <textarea className="lz-notes" rows={4} placeholder="Add a private note for your team…" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="lz-save" onClick={saveNote} disabled={saving}>{saving ? "Saving…" : "Save note"}</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ============ CONFIGURATION (persists to Supabase) ============ */
function Config({ client, refreshClient }) {
  const [f, setF] = useState({
    forward_number: client?.forward_number || "",
    notify_sms: client?.notify_sms ?? true,
    notify_email: client?.notify_email ?? true,
    notify_emails: Array.isArray(client?.notify_emails) ? client.notify_emails : [],
    voice_profile: client?.voice_profile || "Modern",
    tone: client?.tone ?? 50,
    questions: Array.isArray(client?.questions) && client.questions.length ? client.questions : [
      { q: "Is this an emergency (burst pipe, active flooding, no heat)?", t: "BOOLEAN · PRIORITY HIGH" },
      { q: "What is the service address?", t: "TEXT INPUT" },
      { q: "Are you the homeowner or a tenant?", t: "MULTI-CHOICE" },
    ],
  });
  const [newEmail, setNewEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | saving | saved

  if (!client?.id) {
    return <div className="dz-card"><Empty title="No business profile yet" hint="Complete onboarding first — then your AI's routing, voice, and notification settings live here." /></div>;
  }

  const save = async () => {
    setState("saving");
    const { error } = await supabase.from("clients").update({
      forward_number: f.forward_number,
      notify_sms: f.notify_sms,
      notify_email: f.notify_email,
      notify_emails: f.notify_emails,
      voice_profile: f.voice_profile,
      tone: Number(f.tone),
      questions: f.questions,
    }).eq("id", client.id);
    if (error) { alert("Save failed: " + error.message); setState("idle"); return; }
    setState("saved");
    refreshClient?.();
    setTimeout(() => setState("idle"), 2200);
  };

  return (
    <div className="cf">
      <motion.div className="dz-card" variants={rise} initial="hidden" animate="show">
        <div className="dz-card-head"><div className="cf-row" style={{ margin: 0 }}><span className="cf-ic">📡</span><h3>Phone Routing</h3></div></div>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}>Forwarding phone number</label>
        <div className="cf-row" style={{ marginTop: 6 }}>
          <input className="cf-input" placeholder="+1 (555) 123-4567" value={f.forward_number} onChange={(e) => setF({ ...f, forward_number: e.target.value })} />
        </div>
        <div className="cf-status">
          <span className="ok">{client.status === "live" ? "Receptionist live & answering" : "Setup in progress by Answup team"}</span>
        </div>
      </motion.div>

      <motion.div className="dz-card" variants={rise} custom={1} initial="hidden" animate="show">
        <div className="dz-card-head"><div className="cf-row" style={{ margin: 0 }}><span className="cf-ic">🔔</span><h3>Notifications</h3></div></div>
        <div className="cf-tog">
          <div><b>SMS alert per lead</b><small>Text you instantly for every captured lead.</small></div>
          <button className={`sw ${f.notify_sms ? "on" : ""}`} onClick={() => setF({ ...f, notify_sms: !f.notify_sms })} aria-label="toggle sms" />
        </div>
        <div className="cf-tog">
          <div><b>Team email</b><small>Email the team for every new lead.</small></div>
          <button className={`sw ${f.notify_email ? "on" : ""}`} onClick={() => setF({ ...f, notify_email: !f.notify_email })} aria-label="toggle email" />
        </div>
        <div className="cf-emails">
          {f.notify_emails.map((e) => (
            <div className="cf-email" key={e}>{e}<button onClick={() => setF({ ...f, notify_emails: f.notify_emails.filter((x) => x !== e) })}>×</button></div>
          ))}
          <div className="cf-row" style={{ marginBottom: 0 }}>
            <input className="cf-input" placeholder="team@yourcompany.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <button className="cf-btn" onClick={() => { if (newEmail.includes("@")) { setF({ ...f, notify_emails: [...f.notify_emails, newEmail] }); setNewEmail(""); } }}>Add</button>
          </div>
        </div>
      </motion.div>

      <motion.div className="dz-card" variants={rise} custom={2} initial="hidden" animate="show">
        <div className="dz-card-head"><div className="cf-row" style={{ margin: 0 }}><span className="cf-ic">🎙️</span><h3>AI Persona</h3></div></div>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 8 }}>Voice profile</label>
        <div className="voices">
          {[["Modern", "✨"], ["Professional", "💼"], ["Friendly", "😊"]].map(([v, ic]) => (
            <div key={v} className={`voice ${f.voice_profile === v ? "sel" : ""}`} onClick={() => setF({ ...f, voice_profile: v })}>
              <div className="vi">{ic}</div><b>{v}</b>
            </div>
          ))}
        </div>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}>Response tone</label>
        <input type="range" className="cf-range" min="0" max="100" value={f.tone} onChange={(e) => setF({ ...f, tone: e.target.value })} />
        <div className="cf-slider-row"><span>Concise</span><span>Balanced</span><span>Expressive</span></div>
        <div className="cf-sample">
          "{client.greeting || `Hello, thank you for calling ${client.business_name || "your business"}. How can I help you today?`}"
        </div>
      </motion.div>

      <motion.div className="dz-card" variants={rise} custom={3} initial="hidden" animate="show">
        <div className="dz-card-head"><div className="cf-row" style={{ margin: 0 }}><span className="cf-ic">🎯</span><h3>Qualifying Questions</h3></div></div>
        {f.questions.map((x, i) => (
          <div className="cf-q" key={i}>
            <span className="cf-qn">{i + 1}</span>
            <div style={{ flex: 1 }}><b>{x.q}</b><span className="cf-qt">{x.t}</span></div>
            <button className="ad-x" style={{ fontSize: 18 }} onClick={() => setF({ ...f, questions: f.questions.filter((_, j) => j !== i) })}>×</button>
          </div>
        ))}
        <button className="cf-add" style={{ width: "100%", marginTop: 12 }} onClick={() => {
          const q = prompt("New qualifying question:");
          if (q) setF({ ...f, questions: [...f.questions, { q, t: "TEXT INPUT" }] });
        }}>＋ Add qualifying question</button>
      </motion.div>

      <motion.div className="cf-save-bar" variants={rise} custom={4} initial="hidden" animate="show">
        <span style={{ alignSelf: "center", fontSize: 13, color: "var(--muted)" }}>Changes are applied to your AI by our team within 24h.</span>
        <button className="cf-btn" style={{ padding: "13px 26px" }} onClick={save} disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : state === "saved" ? "✓ Saved" : "Save all settings"}
        </button>
      </motion.div>
    </div>
  );
}

/* ============ BILLING (real usage + invoices) ============ */
function Billing({ client, calls, invoices }) {
  const planName = client?.plan ? (planLabel[client.plan] || client.plan) : "No plan yet";
  const planMin = PLAN_MIN[client?.plan] || 1000;
  const minutes = Math.round((calls || []).reduce((s, c) => s + (c.duration_seconds || 0), 0) / 60);
  const pct = Math.min(100, Math.round((minutes / planMin) * 100));

  // daily usage, last 14 days, from real calls
  const daily = Array(14).fill(0);
  (calls || []).forEach((c) => {
    const diff = Math.floor((Date.now() - new Date(c.created_at)) / 86400000);
    if (diff >= 0 && diff < 14) daily[13 - diff] += (c.duration_seconds || 0) / 60;
  });
  const maxD = Math.max(1, ...daily);

  return (
    <>
      <div className="bl">
        <motion.div className="dz-card" variants={rise} initial="hidden" animate="show">
          <div className="dz-card-head"><h3>Current plan</h3><span className={`dz-badge ${client?.paid ? "green" : "amber"}`}>{client?.paid ? "Paid" : "Invoice pending"}</span></div>
          <div className="bl-plan">
            <div className="bl-donut" style={{ "--v": pct }}>
              <div><div><b>{pct}%</b><small>used</small></div></div>
            </div>
            <div className="bl-plan-info">
              <span className="bl-tag">CURRENT PLAN</span>
              <h2>{planName}</h2>
              <small>Billed monthly by invoice · managed by your account manager</small>
              <div className="bl-mins">
                <div className="bl-min"><b>{minutes}</b><small>minutes used</small></div>
                <div className="bl-min"><b>{Math.max(0, planMin - minutes)}</b><small>remaining</small></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="dz-card" variants={rise} custom={1} initial="hidden" animate="show">
          <div className="dz-card-head"><h3>Billing method</h3></div>
          <div className="cc">
            <small>Answup · managed billing</small>
            <div>
              <div className="cc-num">INVOICE / BANK TRANSFER</div>
              <div className="cc-row"><span>No card required — we invoice you monthly</span><b>💳</b></div>
            </div>
          </div>
          <div className="bl-tip" style={{ marginTop: 12 }}>
            <b>Questions about billing?</b> Reply to your invoice email or contact your account manager anytime.
          </div>
        </motion.div>
      </div>

      <div className="bl" style={{ marginTop: 16 }}>
        <motion.div className="dz-card" variants={rise} custom={2} initial="hidden" animate="show">
          <div className="dz-card-head"><h3>Usage, last 14 days</h3><span className="dz-badge">AI minutes / day</span></div>
          {minutes === 0
            ? <Empty title="No usage yet" hint="Once calls start flowing, your daily AI-minute usage shows here." />
            : (
              <div className="bl-bars">
                {daily.map((d, i) => (
                  <div className={`bl-bar ${d === Math.max(...daily) && d > 0 ? "top" : ""}`} key={i}>
                    <motion.i initial={{ height: 0 }} animate={{ height: `${(d / maxD) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.04, ease }} />
                    <small>{new Date(Date.now() - (13 - i) * 86400000).getDate()}</small>
                  </div>
                ))}
              </div>
            )}
        </motion.div>

        <motion.div className="dz-card" variants={rise} custom={3} initial="hidden" animate="show">
          <div className="dz-card-head"><h3>Invoice history</h3></div>
          {!invoices || invoices.length === 0
            ? <Empty title="No invoices yet" hint="Your first invoice appears here after your receptionist goes live." />
            : (
              <div style={{ overflowX: "auto" }}>
                <table className="dz-table">
                  <thead><tr><th>Date</th><th>Invoice</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{new Date(inv.issued_on).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td style={{ color: "var(--muted)" }}>{inv.invoice_no || "—"}</td>
                        <td><b>{inv.amount}</b></td>
                        <td><span className={`dz-badge ${inv.status === "paid" ? "green" : "amber"}`}>{inv.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </motion.div>
      </div>
    </>
  );
}

/* ============ nav icons ============ */
const I = {
  grid: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>,
  users: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 20c.7-3.4 3.2-5.2 6.2-5.2s5.5 1.8 6.2 5.2"/><circle cx="17.2" cy="9.4" r="2.6"/><path d="M15.4 14.9c2.8-.4 5.3 1.2 5.9 4.1"/></svg>,
  sliders: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2.4"/><circle cx="9" cy="16" r="2.4"/></svg>,
  card: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19"/></svg>,
  shield: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7.5 3v5.2c0 4.8-3.2 8.2-7.5 9.8-4.3-1.6-7.5-5-7.5-9.8V6z"/></svg>,
};

/* ============ SHELL ============ */
export default function Dashboard({ user, client, isAdmin, onBack, onSignOut }) {
  const [tab, setTab] = useState(isAdmin ? "signups" : "overview");
  const [calls, setCalls] = useCalls(client, isAdmin);
  const invoices = useInvoices(client, isAdmin);

  const bizName = client?.business_name || (isAdmin ? "Answup HQ" : "Your business");
  const firstName = (user?.user_metadata?.full_name || user?.email || "there").split(" ")[0].split("@")[0];
  const status = client?.status || (isAdmin ? "live" : "pending_review");
  const isPending = !isAdmin && status !== "live";

  const nav = [
    { k: "overview", l: "Dashboard", ic: I.grid },
    { k: "leads", l: "Leads", ic: I.users },
    { k: "config", l: "Configuration", ic: I.sliders },
    { k: "billing", l: "Billing", ic: I.card },
    ...(isAdmin ? [{ k: "signups", l: "Signups", ic: I.shield }] : []),
  ];

  const titles = {
    overview: [`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${firstName} 👋`, `Live performance for ${bizName}.`],
    leads: ["Leads & Transcripts", "Every call, transcribed and scored by your AI."],
    config: ["Configure your AI receptionist", "Tune voice, routing, and notifications. Saved to your account."],
    billing: ["Billing & Usage", "Your plan, real usage, and invoices."],
    signups: ["Client pipeline", "Review signups, build agents, manage billing."],
  };

  return (
    <div className="dz">
      <aside className="dz-side">
        <Logo size={24} onClick={onBack} />
        <div className="dz-role">{isAdmin ? "Admin console" : "AI Receptionist"}</div>
        <nav className="dz-nav">
          {nav.map((n) => (
            <a key={n.k} className={tab === n.k ? "on" : ""} onClick={() => setTab(n.k)}>{n.ic} {n.l}</a>
          ))}
        </nav>
        <div className="dz-foot">
          <div className="dz-plan">{bizName}<small>{isAdmin ? "Administrator" : planLabel[client?.plan] || "Getting set up"}</small></div>
          <div className="dz-foot-row">
            <span className="dz-link" onClick={onSignOut}>Sign out</span>
            <ThemeToggle />
          </div>
          {onBack && <span className="dz-link" style={{ padding: "0 4px" }} onClick={onBack}>← Back to site</span>}
        </div>
      </aside>

      <main className="dz-main">
        <header className="dz-head">
          <div><h1>{titles[tab][0]}</h1><p>{titles[tab][1]}</p></div>
          <div className="dz-live"><Equalizer bars={4} /> {isPending ? "Setting up your receptionist" : "Answup is answering"}</div>
        </header>

        {isPending && tab !== "signups" && (
          <motion.div className="dz-banner" variants={rise} initial="hidden" animate="show">
            <b>🚀 We're building your receptionist.</b>
            <span>Thanks for signing up, {firstName}! Our team is setting up your AI agent for {bizName} now. You'll get an email the moment it's live — then every real call lands right here.</span>
          </motion.div>
        )}

        {tab === "overview" && <Overview calls={calls} client={client} isPending={isPending} onOpenLead={() => setTab("leads")} />}
        {tab === "leads" && <Leads calls={calls} setCalls={setCalls} />}
        {tab === "config" && <Config client={client} />}
        {tab === "billing" && <Billing client={client} calls={calls} invoices={invoices} />}
        {tab === "signups" && isAdmin && <Admin />}
      </main>
    </div>
  );
}
