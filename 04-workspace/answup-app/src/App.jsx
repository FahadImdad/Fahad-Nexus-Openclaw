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

  useEffect(() => {
    if (!inView) return;
    if (phase === "ring") { const t = setTimeout(() => setPhase("chat"), 2200); return () => clearTimeout(t); }
  }, [inView, phase]);

  useEffect(() => {
    if (phase !== "chat") return;
    if (shown < chat.length) { const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 400 : 1100); return () => clearTimeout(t); }
  }, [phase, shown]);

  return (
    <div className="chat" ref={ref}>
      {phase === "ring" && (
        <motion.div className="ring-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="ring-ico">
            <span className="ring-w w1"></span><span className="ring-w w2"></span>
            <motion.div className="ring-phone" animate={{ rotate: [0, -12, 12, -12, 12, 0] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3 }}>
              <LogoMark size={30} light />
            </motion.div>
          </div>
          <div className="ring-txt">Incoming call…</div>
          <div className="ring-sub">Answup is answering</div>
        </motion.div>
      )}
      {phase === "chat" && (
        <>
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
        </>
      )}
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
            <motion.div className="panel" initial={{ opacity: 0, y: 60, rotateX: 12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1, delay: 0.5, ease }}>
              <div className="ptop">
                <div className="who">
                  <div className="av"><LogoMark size={22} light /></div>
                  <div><div className="nm">Answup</div><div className="st"><i></i> Live call · answering now</div></div>
                </div>
                <Equalizer bars={5} />
              </div>
              <LiveChat />
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
