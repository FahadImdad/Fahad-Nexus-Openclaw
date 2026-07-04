import { motion, useScroll, useTransform, useInView, useSpring, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Logo, LogoMark, ThemeToggle, Equalizer } from "./brand.jsx";

const ease = [0.22, 0.61, 0.36, 1];
const rise = { hidden: { opacity: 0, y: 34 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.09, ease } }) };
const R = ({ children, i = 0, className = "", as = "div" }) => {
  const M = motion[as] || motion.div;
  return <M className={className} variants={rise} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>{children}</M>;
};

/* ---- Word-by-word blur reveal for headlines ---- */
function Words({ text, grad = false, base = 0 }) {
  return text.split(" ").map((w, i) => (
    <motion.span
      key={i}
      className={`w ${grad ? "grad" : ""}`}
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay: base + i * 0.09, ease }}
    >
      {w}{" "}
    </motion.span>
  ));
}

/* ---- Magnetic button ---- */
function Magnetic({ children }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    ref.current.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
  };
  const onLeave = () => { ref.current.style.transform = "translate(0,0)"; };
  return (
    <span ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: "inline-block", transition: "transform .3s cubic-bezier(.22,.61,.36,1)" }}>
      {children}
    </span>
  );
}

/* ---- Count-up ---- */
function Counter({ value, suffix = "", prefix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (inView) { const c = animate(0, value, { duration: 1.6, ease: "easeOut", onUpdate: (v) => setVal(Math.round(v)) }); return () => c.stop(); }
  }, [inView, value]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ---- Mouse-spotlight bento cell ---- */
function SpotCell({ className, children }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <motion.div ref={ref} onMouseMove={onMove} className={`cell ${className}`} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      {children}
    </motion.div>
  );
}

/* ---- Hero equalizer strip ---- */
function HeroEq() {
  const heights = [10, 18, 26, 16, 30, 22, 14, 28, 20, 12, 24, 30, 18, 10, 26, 16, 22, 12];
  return (
    <motion.div className="hero-eq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.8 }}>
      {heights.map((h, i) => (
        <i key={i} style={{ height: h, animationDelay: `${i * 0.07}s` }} />
      ))}
    </motion.div>
  );
}

/* ---- Live ringing call demo ---- */
const chat = [
  { who: "ai", text: "Thanks for calling Rapid Comfort Heating & Cooling! This is Ava. Is it a heating or cooling issue?" },
  { who: "user", text: "Hi, my heater stopped working and it's freezing in here." },
  { who: "ai", text: "Oh no, sorry to hear that! Let me get your details so a technician can call you right back. What's your name?" },
  { who: "user", text: "It's John Carter." },
  { who: "ai", text: "Got it, John. And the best number to reach you?" },
];

function LiveChat() {
  const [phase, setPhase] = useState("ring");
  const [shown, setShown] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const [accepted, setAccepted] = useState(false);
  const [secs, setSecs] = useState(0);

  // ring for ~2.6s: green button "presses" at 2.1s, call connects at 2.6s
  // (?ring=1 freezes the incoming-call screen for design checks)
  useEffect(() => {
    if (!inView || phase !== "ring") return;
    if (new URLSearchParams(window.location.search).has("ring")) return;
    const t1 = setTimeout(() => setAccepted(true), 2100);
    const t2 = setTimeout(() => setPhase("chat"), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView, phase]);

  // conversation plays + call timer runs
  useEffect(() => {
    if (phase !== "chat") return;
    const tick = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [phase]);

  useEffect(() => {
    if (phase !== "chat") return;
    if (shown < chat.length) { const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 500 : 1300); return () => clearTimeout(t); }
  }, [phase, shown]);

  const clock = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div className="phone-body" ref={ref}>
      <PhStatus />
      {phase === "ring" && (
        <motion.div className="ic-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="ic-label">incoming call</div>
          <div className="ic-name">John Carter</div>
          <div className="ic-num">mobile · Dallas, TX</div>
          <motion.div className="ic-avatar" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>JC</motion.div>
          <div className="ic-actions">
            <div className="ic-a">
              <div className="ic-btn decline">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.29-.7.29-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.49c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.37-2.67-1.86-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
              </div>
              <small>Decline</small>
            </div>
            <div className="ic-a">
              <div className={`ic-btn accept ${accepted ? "pressed" : ""}`}>
                <span className="ic-ring r1" /><span className="ic-ring r2" />
                <motion.svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" animate={accepted ? { rotate: 0 } : { rotate: [0, -14, 14, -14, 14, 0] }} transition={{ duration: 1, repeat: accepted ? 0 : Infinity, repeatDelay: 0.4 }}>
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </motion.svg>
              </div>
              <small>Accept</small>
            </div>
          </div>
        </motion.div>
      )}
      {phase === "chat" && (
        <motion.div className="call-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <div className="ph-callinfo">
            <small>{clock}</small>
            <b>John Carter</b>
          </div>
          <div className="ph-chat">
            {chat.slice(0, shown).map((m, i) => (
              <motion.div key={i} className={`bub ${m.who}`} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease }}>
                {m.text}
              </motion.div>
            ))}
            {shown < chat.length && (
              <motion.div className="bub ai typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span></span><span></span><span></span>
              </motion.div>
            )}
          </div>
          <div className="ph-pill"><LogoMark size={13} light /> Answup AI · answering this call</div>
          <div className="ph-controls">
            {[
              ["spk", "Speaker", <svg key="s" width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1-3.29-2.5-4.03v8.05c1.5-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>],
              ["ft", "FaceTime", <svg key="f" width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>],
              ["mute", "Mute", <svg key="m" width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/></svg>],
              ["more", "More", <svg key="o" width="22" height="22" viewBox="0 0 24 24" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>],
              ["end", "End", <svg key="e" width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.29-.7.29-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.49c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.37-2.67-1.86-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>],
              ["pad", "Keypad", <svg key="k" width="22" height="22" viewBox="0 0 24 24" fill="#fff"><circle cx="6" cy="5" r="1.7"/><circle cx="12" cy="5" r="1.7"/><circle cx="18" cy="5" r="1.7"/><circle cx="6" cy="11" r="1.7"/><circle cx="12" cy="11" r="1.7"/><circle cx="18" cy="11" r="1.7"/><circle cx="6" cy="17" r="1.7"/><circle cx="12" cy="17" r="1.7"/><circle cx="18" cy="17" r="1.7"/></svg>],
            ].map(([k, label, icon]) => (
              <div className="ph-ctl" key={k}>
                <div className={`ph-ctl-btn ${k === "end" ? "end" : ""}`}>{icon}</div>
                <small>{label}</small>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* iOS status bar (time + signal/wifi/battery) */
function PhStatus() {
  return (
    <div className="ph-status">
      <span className="ph-time">9:41</span>
      <span className="ph-sig">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="#fff"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
        <svg width="16" height="11" viewBox="0 0 16 12" fill="#fff"><path d="M8 9.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM8 5.6c-1.8 0-3.4.73-4.57 1.9l1.42 1.42A4.43 4.43 0 0 1 8 7.6c1.22 0 2.33.5 3.15 1.32l1.42-1.42A6.43 6.43 0 0 0 8 5.6zM8 1.5A10.5 10.5 0 0 0 .57 4.57L2 6a8.5 8.5 0 0 1 12 0l1.43-1.43A10.5 10.5 0 0 0 8 1.5z" transform="translate(0,-1)"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="#fff" strokeOpacity=".5"/><rect x="2" y="2" width="18" height="8" rx="1.6" fill="#fff"/><path d="M23 4v4c1-.3 1.6-1 1.6-2s-.6-1.7-1.6-2z" fill="#fff" fillOpacity=".5"/></svg>
      </span>
    </div>
  );
}

const tiers = [
  { id: "after-hours", name: "After-Hours", td: "We set up and run a 24/7 receptionist for nights, weekends, and overflow, fully managed.", p: "$397", pm: "Includes 500 call minutes · done-for-you", hot: false,
    li: ["Done-for-you setup, ready in a day", "24/7 AI call answering", "Full caller details captured", "Instant text alerts to you", "Emergency flagging", "English & Spanish"] },
  { id: "always-on", name: "Always-On", td: "Full-time coverage for busy shops. We build, manage, and fine-tune it for you.", p: "$697", pm: "Includes 1,000 call minutes · done-for-you", hot: true,
    li: ["Everything in After-Hours", "Appointment booking", "Calendar integration", "Connects to your CRM", "We monitor & optimize it monthly", "Priority support"] },
  { id: "growth", name: "Growth", td: "For multi-truck and multi-location operations that never want to miss a job.", p: "$1,197", pm: "Includes 2,500 call minutes · done-for-you", hot: false,
    li: ["Everything in Always-On", "Multiple phone numbers", "Monthly call & ROI reports", "Multi-location support", "Dedicated account manager", "White-glove management"] },
];

const TRADES = ["HVAC", "Plumbing", "Electrical", "Roofing", "Garage Doors", "Appliance Repair", "Landscaping", "Pest Control"];

export default function App({ onDashboard, onStart }) {
  const heroRef = useRef(null);
  const { scrollYProgress: pageProgress } = useScroll();
  const progressX = useSpring(pageProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const panelY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const panelRot = useTransform(scrollYProgress, [0, 1], [0, -4]);
  const panelScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  const marq = TRADES.map((t, i) => <b key={i}>●</b>).flatMap((dot, i) => [<em key={`t${i}`} style={{ fontStyle: "normal" }}>{TRADES[i]}</em>, dot]);

  return (
    <>
      <motion.div className="progress" style={{ scaleX: progressX }} />
      <div className="bg-fx"><b className="b1" /><b className="b2" /><b className="b3" /></div>
      <div className="grid-fx" />

      <nav className="site-nav">
        <div className="wrap nav-in">
          <Logo size={26} />
          <div className="nav-links">
            <a href="#features">Features</a><a href="#how">How it works</a><a href="#pricing">Pricing</a>
            <a onClick={onDashboard}>Sign in</a><a href="#contact">Contact</a>
          </div>
          <div className="nav-right">
            <ThemeToggle />
            <a onClick={() => onStart()} className="btn btn-grad" style={{ padding: "10px 22px", fontSize: 14, cursor: "pointer" }}>Get Started</a>
          </div>
        </div>
      </nav>

      {/* HERO — pitch left, live demo right */}
      <section className="hero" ref={heroRef}>
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <motion.div className="pill" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
              <span className="dot" /> Answering calls 24/7 for home-service pros
            </motion.div>
            <h1>
              <Words text="Never miss a call." base={0.15} /><br />
              <Words text="Never lose a customer." grad base={0.55} />
            </h1>
            <motion.p className="hero-sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: 1.0, ease }}>
              Answup is the AI receptionist for the trades. It answers every call, captures every lead, and texts you the details, so you win the job while your competitors are still ringing.
            </motion.p>
            <motion.div className="hero-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: 1.15, ease }}>
              <Magnetic><a onClick={() => onStart()} className="btn btn-grad" style={{ cursor: "pointer" }}>Get Started Free →</a></Magnetic>
              <Magnetic><a href="#contact" className="btn btn-soft">Book a Demo</a></Magnetic>
            </motion.div>
            <HeroEq />
          </div>

          <motion.div className="stage" style={{ y: panelY, rotateX: panelRot, scale: panelScale }}>
            <motion.div className="chip-float c1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.7, duration: .7, ease }}>
              <span className="chip-ic">👤</span>
              <span>Lead captured<small>John Carter · (214) 555-0182</small></span>
            </motion.div>
            <motion.div className="chip-float c2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.2, duration: .7, ease }}>
              <span className="chip-ic">🚨</span>
              <span>Emergency flagged<small>No heat · priority dispatch</small></span>
            </motion.div>
            <motion.div className="phone" initial={{ opacity: 0, y: 60, rotateX: 12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1, delay: 0.5, ease }}>
              <div className="phone-island" />
              <div className="phone-screen">
                <LiveChat />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marq-track">
          <span>{marq}</span>
          <span aria-hidden="true">{marq}</span>
        </div>
      </div>

      {/* COUNTERS */}
      <section>
        <div className="wrap">
          <R className="eyebrow">The cost of a missed call</R>
          <R as="h2" className="sh" i={1}>Every unanswered call is money walking away.</R>
          <R as="p" className="sl" i={2}>When you're on a job or closed for the night, most callers won't leave a voicemail. They just call the next company.</R>
          <div className="counters">
            <R className="counter" i={0}><div className="n"><Counter value={25} suffix="%" /></div><div className="l">of calls to small businesses go unanswered</div></R>
            <R className="counter" i={1}><div className="n"><Counter value={85} suffix="%" /></div><div className="l">of missed callers never call back</div></R>
            <R className="counter" i={2}><div className="n"><Counter value={12} prefix="$" suffix="k+" /></div><div className="l">in jobs lost each year to voicemail</div></R>
          </div>
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section id="features">
        <div className="wrap">
          <R className="eyebrow">Meet Answup</R>
          <R as="h2" className="sh" i={1}>A receptionist that never sleeps.</R>
          <R as="p" className="sl" i={2}>Human-sounding, always available, and built to turn every call into a booked job.</R>
          <div className="bento">
            <SpotCell className="big dark"><div className="fi">🕐</div><h3>Answers 24/7, on the first ring</h3><p>Nights, weekends, holidays, or while you're up on a roof, Answup picks up every single call, instantly. Your customers never hear a voicemail again.</p></SpotCell>
            <SpotCell className="sm"><div className="fi">🚨</div><h3>Spots emergencies</h3><p>Flags no-heat, leaks, and no-AC calls so you respond first.</p></SpotCell>
            <SpotCell className="half accent"><div className="fi">📋</div><h3>Captures every detail</h3><p>Name, number, address, and the problem, taken down accurately and texted to you within seconds.</p></SpotCell>
            <SpotCell className="half"><div className="fi">🗣️</div><h3>Sounds genuinely human</h3><p>A warm, natural voice that greets customers by your company name, not a robotic phone menu.</p></SpotCell>
            <SpotCell className="sm"><div className="fi">🌎</div><h3>English & Spanish</h3><p>Answers in the caller's own language automatically.</p></SpotCell>
            <SpotCell className="big accent"><div className="fi">⚡</div><h3>Live in a single day</h3><p>We build it, connect it to your existing number, and you're capturing calls the same day. No apps, no hardware, no tech skills required.</p></SpotCell>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how">
        <div className="wrap">
          <R className="eyebrow">How it works</R>
          <R as="h2" className="sh" i={1}>From missed call to booked job.</R>
          <R as="p" className="sl" i={2}>Four steps. Set up once, capture calls forever.</R>
          <div className="tl">
            {[["01","Forward your calls","Keep your number. Forward missed or after-hours calls to Answup in two minutes."],
              ["02","Answup answers","Your AI receptionist greets the caller and handles the whole conversation."],
              ["03","It captures the lead","Name, number, address, and problem, all recorded accurately, every time."],
              ["04","You get the details","The full lead is texted to your phone. Call back and win the job."]].map(([n,h,p],i)=>(
              <R className="tl-i" i={i} key={n}><div className="num">{n}</div><h4>{h}</h4><p>{p}</p></R>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="wrap">
          <R className="eyebrow">Pricing</R>
          <R as="h2" className="sh" i={1}>Pays for itself with one job.</R>
          <R as="p" className="sl" i={2}>Unlike DIY tools, we set it up, manage it, and fine-tune it for you, you do nothing. No contracts, cancel anytime, and one captured job pays for the whole month.</R>
          <div className="tiers">
            {tiers.map((t,i)=>(
              <motion.div className={`tier ${t.hot?"hot":""}`} key={t.name} variants={rise} custom={i} initial="hidden" whileInView="show" viewport={{once:true,amount:0.2}} whileHover={{y:-8}} transition={{type:"spring",stiffness:300,damping:24}}>
                {t.hot && <span className="flag">Most popular</span>}
                <h3>{t.name}</h3>
                <div className="td">{t.td}</div>
                <div className="p">{t.p}<span> /mo</span></div>
                <div className="pm">{t.pm}</div>
                <ul>{t.li.map((x)=><li key={x}><span className="c">✓</span> {x}</li>)}</ul>
                <a onClick={() => onStart(t.id)} className={`btn ${t.hot?"btn-grad":"btn-soft"}`} style={{ cursor: "pointer" }}>Get Started</a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="quote">
        <div className="wrap narrow">
          <R as="p" className="qm">"Every call we used to lose now shows up as a text with the customer's info. It's paid for itself ten times over."</R>
          <R i={1} className="who">The kind of result home-service owners see with Answup.</R>
        </div>
      </section>

      {/* FINAL */}
      <section className="final" id="contact">
        <div className="wrap narrow">
          <R className="box">
            <h2 className="sh" style={{ marginBottom: 16 }}>Hear it answer a call, live.</h2>
            <p className="sl" style={{ marginBottom: 30, marginLeft: "auto", marginRight: "auto" }}>Book a free demo and listen to your future AI receptionist handle a real call. No pressure, no commitment.</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              <Magnetic><a onClick={() => onStart()} className="btn btn-grad" style={{ cursor: "pointer" }}>Get Started Online →</a></Magnetic>
              <Magnetic><a href="mailto:fahadimdad966@gmail.com" className="btn btn-soft">Book Your Free Demo</a></Magnetic>
            </div>
          </R>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot">
            <Logo size={24} />
            <div className="foot-links"><a href="#features">Features</a><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="mailto:fahadimdad966@gmail.com">Contact</a></div>
          </div>
          <div className="foot-copy">© 2026 Answup · A 24/7 AI answering service for home-service businesses.</div>
        </div>
        <div className="foot-mark">answup</div>
      </footer>
    </>
  );
}
