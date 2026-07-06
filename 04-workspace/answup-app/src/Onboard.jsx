import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "./lib/supabase";
import { Logo, ThemeToggle } from "./brand.jsx";

const ease = [0.22, 0.61, 0.36, 1];

const TRADES = ["HVAC", "Plumbing", "Electrical", "Roofing", "Garage Doors", "Appliance Repair", "Other"];
const PLANS = [
  { id: "after-hours", name: "After-Hours", price: "$397/mo", desc: "500 min • nights & weekends" },
  { id: "always-on", name: "Always-On", price: "$697/mo", desc: "1,000 min • 24/7 coverage" },
  { id: "growth", name: "Growth", price: "$1,197/mo", desc: "2,500 min • multi-location" },
];

export default function Onboard({ user, onDone }) {
  const [f, setF] = useState({
    business_name: "",
    trade: "HVAC",
    phone: "",
    website: "",
    city: "",
    state: "",
    service_area: "",
    hours: "After hours + weekends",
    greeting: "",
    plan: localStorage.getItem("answup-plan") || "always-on",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    if (!f.business_name || !f.phone) {
      alert("Please add your business name and phone number.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("clients").upsert(
      {
        user_id: user.id,
        email: user.email,
        status: "pending_review",
        ...f,
      },
      { onConflict: "user_id" }
    );
    if (!error) await supabase.rpc("onboarding_complete");   // auto-accept + auto-kickoff message
    setSaving(false);
    if (error) {
      alert("Could not save: " + error.message);
      return;
    }
    localStorage.removeItem("answup-plan");
    onDone();
  };

  return (
    <div className="ob-wrap">
      <div className="ob-aurora" />
      <motion.div
        className="ob-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <Logo size={26} />
        <div style={{ position: "fixed", top: 18, right: 18 }}><ThemeToggle /></div>
        <div className="ob-steps">
          <span className={step >= 1 ? "on" : ""}>1 · Business</span>
          <i />
          <span className={step >= 2 ? "on" : ""}>2 · Coverage</span>
          <i />
          <span className={step >= 3 ? "on" : ""}>3 · Plan</span>
        </div>

        {step === 1 && (
          <motion.div className="ob-body" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1>Tell us about your business</h1>
            <p className="ob-sub">We build your receptionist around this. Takes about a minute.</p>
            <label>Business name<input value={f.business_name} onChange={set("business_name")} placeholder="Rapid Comfort Heating & Cooling" /></label>
            <div className="ob-row">
              <label>Trade<select value={f.trade} onChange={set("trade")}>{TRADES.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label>Business phone<input value={f.phone} onChange={set("phone")} placeholder="(214) 555-0100" /></label>
            </div>
            <label>Website (optional)<input value={f.website} onChange={set("website")} placeholder="rapidcomforthvac.com" /></label>
            <div className="ob-nav"><span /><button className="ob-next" onClick={() => setStep(2)}>Continue →</button></div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div className="ob-body" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1>Where and when do you work?</h1>
            <p className="ob-sub">So your receptionist knows your service area and hours.</p>
            <div className="ob-row">
              <label>City<input value={f.city} onChange={set("city")} placeholder="Dallas" /></label>
              <label>State<input value={f.state} onChange={set("state")} placeholder="TX" /></label>
            </div>
            <label>Service area<input value={f.service_area} onChange={set("service_area")} placeholder="Dallas, Plano, Frisco, Irving" /></label>
            <label>When should we answer?<select value={f.hours} onChange={set("hours")}>
              <option>After hours + weekends</option>
              <option>24/7 (all calls)</option>
              <option>Overflow only (when you're busy)</option>
            </select></label>
            <label>How should we greet callers? (optional)<input value={f.greeting} onChange={set("greeting")} placeholder="Thanks for calling Rapid Comfort, this is Ava!" /></label>
            <div className="ob-nav"><button className="ob-back" onClick={() => setStep(1)}>← Back</button><button className="ob-next" onClick={() => setStep(3)}>Continue →</button></div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div className="ob-body" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1>Pick your plan</h1>
            <p className="ob-sub">No charge today. We set everything up, then send your first invoice once you approve.</p>
            <div className="ob-plans">
              {PLANS.map((p) => (
                <div key={p.id} className={`ob-plan ${f.plan === p.id ? "sel" : ""}`} onClick={() => setF({ ...f, plan: p.id })}>
                  <b>{p.name}</b>
                  <span className="ob-price">{p.price}</span>
                  <small>{p.desc}</small>
                </div>
              ))}
            </div>
            <label>Anything else we should know? (optional)<textarea value={f.notes} onChange={set("notes")} rows={3} placeholder="We charge a $89 diagnostic. Emergencies get priority. Don't book Sundays." /></label>
            <div className="ob-nav"><button className="ob-back" onClick={() => setStep(2)}>← Back</button>
              <button className="ob-next" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Submit & set up my receptionist →"}</button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
