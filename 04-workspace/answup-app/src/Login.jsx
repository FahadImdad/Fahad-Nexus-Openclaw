import { motion } from "framer-motion";
import { supabase } from "./lib/supabase";
import { Logo, ThemeToggle } from "./brand.jsx";

const ease = [0.22, 0.61, 0.36, 1];

export default function Login({ onBack }) {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) alert("Sign-in error: " + error.message);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-aurora" />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease }}
      >
        <Logo size={30} />
        <h1 className="auth-h1">Welcome to Answup</h1>
        <p className="auth-sub">Sign in, or create your account in seconds, to set up your AI receptionist and see every call it captures.</p>

        <button className="auth-google" onClick={signInWithGoogle}>
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 34.5 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.6C41.4 36.6 44 30.9 44 24c0-1.3-.1-2.3-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <p className="auth-fine">
          By continuing you agree to our terms. New here? Signing in creates your account automatically.
        </p>

        <a className="auth-back" onClick={onBack}>← Back to site</a>
      </motion.div>
      <div style={{ position: "fixed", top: 18, right: 18, zIndex: 5 }}><ThemeToggle /></div>
    </div>
  );
}
