import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "./lib/supabase";
import { Logo, ThemeToggle } from "./brand.jsx";

const ease = [0.22, 0.61, 0.36, 1];

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@answup.com");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setErr(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
    // on success the auth listener in main.jsx re-renders into the admin console
  };

  return (
    <div className="auth-wrap">
      <div className="auth-aurora" />
      <motion.div className="auth-card" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease }}>
        <Logo size={30} />
        <h1 className="auth-h1">Admin console</h1>
        <p className="auth-sub">Answup staff only. Clients sign in on the main site.</p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
          <input className="cf-input" type="email" placeholder="admin@answup.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          <input className="cf-input" type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
          {err && <div style={{ color: "var(--red)", fontSize: 13, fontWeight: 600 }}>{err}</div>}
          <button className="ob-next" type="submit" disabled={busy || !pw} style={{ width: "100%" }}>
            {busy ? "Signing in…" : "Sign in →"}
          </button>
        </form>
        <a className="auth-back" href="/">← Back to site</a>
      </motion.div>
      <div style={{ position: "fixed", top: 18, right: 18, zIndex: 5 }}><ThemeToggle /></div>
    </div>
  );
}
