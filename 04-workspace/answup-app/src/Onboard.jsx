import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { Logo, ThemeToggle, LogoMark } from "./brand.jsx";

const ease = [0.22, 0.61, 0.36, 1];

/* Chat-style onboarding: one question at a time, tappable illustrated options,
   free-type always allowed, skip on anything optional. Feels like texting Ava,
   not filling a form. Every answer lands in the same client row. */
const QUESTIONS = [
  {
    key: "business_name",
    ava: "Hey! I'm Ava, your new AI receptionist. Let's get you set up — it takes about a minute. First, what's your business name?",
    type: "text",
    placeholder: "Rapid Comfort Heating & Cooling",
    required: true,
  },
  {
    key: "trade",
    ava: "Great to meet you! What kind of work do you do?",
    type: "chips-one",
    options: [
      { v: "HVAC", ic: "❄️" }, { v: "Plumbing", ic: "🔧" }, { v: "Electrical", ic: "⚡" },
      { v: "Roofing", ic: "🏠" }, { v: "Garage Doors", ic: "🚪" }, { v: "Appliance Repair", ic: "🔩" },
    ],
    placeholder: "or type your trade…",
  },
  {
    key: "service_area",
    ava: "Which areas do you cover? A city or a few nearby towns is perfect.",
    type: "text",
    placeholder: "Dallas, Plano, Frisco",
    skippable: true,
  },
  {
    key: "hours",
    ava: "When should I answer your phone?",
    type: "chips-one",
    options: [
      { v: "After hours + weekends", ic: "🌙" }, { v: "24/7 — every call", ic: "🕐" }, { v: "Overflow when you're busy", ic: "📈" },
    ],
    placeholder: "or describe your hours…",
    skippable: true,
  },
  {
    key: "emergencies",
    ava: "What counts as an emergency? I'll flag these the instant they call. Tap all that apply.",
    type: "chips-many",
    options: [
      { v: "No heat", ic: "🥶" }, { v: "No AC", ic: "🥵" }, { v: "Burst pipe / leak", ic: "💧" },
      { v: "Gas smell", ic: "⚠️" }, { v: "No power", ic: "🔌" }, { v: "Sewage backup", ic: "🚽" },
    ],
    placeholder: "or add your own…",
    skippable: true,
  },
  {
    key: "greeting",
    ava: "How should I greet your callers? Leave it to me if you're not sure — I'll sound warm and professional.",
    type: "text",
    placeholder: "Thanks for calling Rapid Comfort, this is Ava!",
    skippable: true,
  },
  {
    key: "lead_phone",
    ava: "Last one! Where should I text you each new lead the second a call ends?",
    type: "text",
    placeholder: "(214) 555-0100",
    inputMode: "tel",
    skippable: true,
  },
];

function Typing() {
  return (
    <div className="ob-typing"><span /><span /><span /></div>
  );
}

export default function Onboard({ user, onDone, preview = false }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [draft, setDraft] = useState("");
  const [multi, setMulti] = useState([]);
  const [typing, setTyping] = useState(true);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef(null);
  const q = QUESTIONS[i];
  const done = i >= QUESTIONS.length;
  const pct = Math.round((Math.min(i, QUESTIONS.length) / QUESTIONS.length) * 100);

  // Ava "types" before each question appears
  useEffect(() => {
    if (done) return;
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 650);
    return () => clearTimeout(t);
  }, [i, done]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [i, typing]);

  const advance = (value) => {
    const next = { ...answers };
    next[q.key] = Array.isArray(value) ? value.join(", ") : value;
    setAnswers(next);
    setDraft(""); setMulti([]);
    if (i + 1 >= QUESTIONS.length) finish(next);
    else setI(i + 1);
  };
  const submitText = () => { const v = draft.trim(); if (q.required && !v) return; advance(v); };
  const skip = () => advance("");
  const toggleMulti = (opt) => setMulti((m) => (m.includes(opt) ? m.filter((x) => x !== opt) : [...m, opt]));

  const finish = async (all) => {
    setSaving(true);
    if (preview) { setSaving(false); setTimeout(onDone, 1400); return; }  // design preview: no DB
    const notesBits = [];
    if (all.emergencies) notesBits.push(`Emergencies: ${all.emergencies}`);
    if (all.lead_phone) notesBits.push(`Text leads to: ${all.lead_phone}`);
    const row = {
      user_id: user.id, email: user.email, status: "pending_review",
      business_name: all.business_name || "", trade: all.trade || "",
      service_area: all.service_area || "", hours: all.hours || "",
      greeting: all.greeting || "", phone: all.lead_phone || "",
      plan: localStorage.getItem("answup-plan") || "always-on",
      notes: notesBits.join(" · "),
    };
    const { error } = await supabase.from("clients").upsert(row, { onConflict: "user_id" });
    if (!error) {
      await supabase.rpc("onboarding_complete");
      supabase.auth.getSession().then(({ data }) => {
        const t = data?.session?.access_token;
        if (t) fetch("/api/autobuild", { method: "POST", headers: { Authorization: `Bearer ${t}` } }).catch(() => {});
      });
    }
    setSaving(false);
    if (error) { alert("Could not save: " + error.message); return; }
    localStorage.removeItem("answup-plan");
    setTimeout(onDone, 1400); // let the celebration play
  };

  const history = QUESTIONS.slice(0, i);

  return (
    <div className="ob-wrap">
      <div className="ob-aurora" />
      <motion.div className="ob-chat-card" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease }}>
        <div className="ob-chat-head">
          <div className="ob-head-id">
            <div className="ob-head-av"><LogoMark size={15} light /></div>
            <div><b>Ava</b><small>{done ? "Building your receptionist…" : typing ? "typing…" : "AI receptionist · online"}</small></div>
          </div>
          <div className="ob-head-right">
            <div className="ob-progress-ring">
              <svg viewBox="0 0 36 36"><circle className="ob-ring-bg" cx="18" cy="18" r="15.9" /><motion.circle className="ob-ring-fg" cx="18" cy="18" r="15.9" strokeDasharray="100" animate={{ strokeDashoffset: 100 - pct }} transition={{ duration: 0.6, ease }} /></svg>
              <span>{pct}%</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="ob-chat-scroll" ref={scrollRef}>
          {history.map((hq) => (
            <div key={hq.key} className="ob-turn">
              <div className="ob-ava"><div className="ob-ava-ic"><LogoMark size={11} light /></div><div className="ob-bub-ava">{hq.ava}</div></div>
              <motion.div className="ob-bub-me" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
                {answers[hq.key] ? answers[hq.key] : <i>Skipped</i>}
              </motion.div>
            </div>
          ))}

          {!done && (
            <div className="ob-turn">
              <div className="ob-ava">
                <div className="ob-ava-ic"><LogoMark size={11} light /></div>
                <AnimatePresence mode="wait">
                  {typing
                    ? <motion.div key="t" className="ob-bub-ava" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Typing /></motion.div>
                    : <motion.div key="q" className="ob-bub-ava" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{q.ava}</motion.div>}
                </AnimatePresence>
              </div>
            </div>
          )}

          {done && (
            <motion.div className="ob-done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }}>
              <motion.div className="ob-done-ic" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 200 }}>🎉</motion.div>
              <b>You're all set, {answers.business_name || "partner"}!</b>
              <small>I'm building your receptionist right now. This takes a moment…</small>
            </motion.div>
          )}
        </div>

        {!done && !typing && (
          <motion.div className="ob-input-zone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {(q.type === "chips-one" || q.type === "chips-many") && (
              <div className="ob-chips">
                {q.options.map((opt) => {
                  const on = q.type === "chips-many" ? multi.includes(opt.v) : false;
                  return (
                    <motion.button key={opt.v} className={`ob-chip ${on ? "on" : ""}`} whileTap={{ scale: 0.94 }}
                      onClick={() => q.type === "chips-many" ? toggleMulti(opt.v) : advance(opt.v)}>
                      <span className="ob-chip-ic">{opt.ic}</span>{opt.v}
                      {q.type === "chips-many" && <span className="ob-chip-check">{on ? "✓" : ""}</span>}
                    </motion.button>
                  );
                })}
              </div>
            )}
            <div className="ob-compose">
              <input autoFocus value={draft} inputMode={q.inputMode} placeholder={q.placeholder}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitText(); }} />
              {q.type === "chips-many" && (multi.length > 0 || draft.trim()) ? (
                <button className="ob-send" onClick={() => advance([...multi, ...(draft.trim() ? [draft.trim()] : [])])}>Next →</button>
              ) : (
                <button className="ob-send" onClick={submitText} disabled={q.required && !draft.trim()}>Send →</button>
              )}
            </div>
            <div className="ob-input-foot">
              {q.skippable && !q.required && <button className="ob-skip" onClick={skip}>Skip →</button>}
              {q.required && <small className="ob-req">Just this one to get started</small>}
              {q.type === "chips-many" && <small className="ob-hint">tap any that fit, or add your own</small>}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
