# ANSWUP DESIGN SYSTEM — portable reference
*Copy this file into any Claude Code project (e.g. as `DESIGN-SYSTEM.md` at root, or reference it from CLAUDE.md) and tell Claude: "follow DESIGN-SYSTEM.md". Everything needed to replicate the look is in this one file.*

---

## 1. Brand identity

**Concept:** sound-wave bars morphing into a phone handset. Voice + always-answering.
**Wordmark:** lowercase `answup`, Space Grotesk Bold, tight letter-spacing (-0.04em).
**Feel:** futuristic-but-trustworthy SaaS. Glassy, glowing, precise. Never cartoonish.

### Logo (React/SVG, theme-aware)
```jsx
export function LogoMark({ size = 34, mono = false, light = false }) {
  const c = mono ? "currentColor" : light ? "#fff" : "var(--blue)";
  return (
    <svg width={size} height={size} viewBox="0 0 72 64" fill="none" aria-hidden="true">
      <rect x="1"  y="25" width="7" height="14" rx="3.5" fill={c} />
      <rect x="12" y="18" width="7" height="28" rx="3.5" fill={c} />
      <rect x="23" y="8"  width="7" height="48" rx="3.5" fill={c} />
      <rect x="34" y="13" width="7" height="38" rx="3.5" fill={c} />
      {/* Material "call" handset glyph */}
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill={c} transform="translate(39.5,15.5) scale(1.38)" />
    </svg>
  );
}
// Full logo: mark + <span class="logo-word">answup</span>
```

Favicon: blue rounded square (#2A6BFF, rx 15/64) with the mark in white.

---

## 2. Color system (CSS variables, light + dark)

Theme switches by setting `data-theme="dark"` on `<html>`. ALL colors go through variables — never hardcode.

```css
:root {
  --bg: #ffffff;        --bg-soft: #f5f7fd;   --card: #ffffff;
  --ink: #0a1735;       --ink2: #2b3a5e;      --muted: #64719a;
  --line: #e6eaf6;
  --blue: #2a6bff;      --blue-deep: #1e56e8; --cyan: #19b8ff;
  --green: #0fbf7f;     --red: #f04d6d;       --amber: #f59e0b;
  --glow: rgba(42,107,255,.22);
  --glass: rgba(255,255,255,.72);
  --shadow-sm: 0 2px 10px rgba(10,23,53,.05);
  --shadow-md: 0 12px 34px rgba(10,23,53,.10);
  --shadow-lg: 0 30px 80px rgba(10,23,53,.16);
  --grad: linear-gradient(115deg, var(--blue), var(--cyan));
  color-scheme: light;
}
:root[data-theme="dark"] {
  --bg: #050b1e;        --bg-soft: #0a1230;   --card: #0b1430;
  --ink: #eef2ff;       --ink2: #c6cfec;      --muted: #8d98c0;
  --line: rgba(146,166,226,.14);
  --blue: #3f7dff;      --blue-deep: #2a6bff; --cyan: #22c3ff;
  --glow: rgba(63,125,255,.30);
  --glass: rgba(8,15,38,.68);
  --shadow-sm: 0 2px 10px rgba(0,0,0,.30);
  --shadow-md: 0 12px 34px rgba(0,0,0,.45);
  --shadow-lg: 0 30px 80px rgba(0,0,0,.55);
  color-scheme: dark;
}
/* smooth theme transition */
*, *::before, *::after { transition: background-color .35s ease, border-color .35s ease, color .18s ease; }
```

Semantic accents: green = live/success, red = emergency/danger, amber = pending, blue = brand/action.

---

## 3. Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
body { font-family: 'Inter', sans-serif; font-size: 16.5px; letter-spacing: -0.01em; line-height: 1.55; }
h1, h2, h3, .display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.03em; }
```
- **Display/headings/stat numbers:** Space Grotesk (futuristic, geometric)
- **Body/UI:** Inter
- Hero: `clamp(46px, 7.4vw, 84px)`, weight 700, line-height 1.04
- Section heads: `clamp(30px, 4.4vw, 46px)`
- Eyebrow labels: 12.5px, 700, uppercase, letter-spacing .16em, color var(--blue), with a 26px gradient dash `::before`

---

## 4. Theme engine (drop-in)

```jsx
const KEY = "app-theme";
export function initTheme() {   // call before render
  const saved = localStorage.getItem(KEY);
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = saved || (dark ? "dark" : "light");
}
export function useTheme() {
  const [t, setT] = useState(() => document.documentElement.dataset.theme || "light");
  const set = (v) => { document.documentElement.dataset.theme = v; localStorage.setItem(KEY, v); setT(v); };
  return [t, set];
}
// ThemeToggle: 38px square button, sun/moon SVG swap with pop animation:
// @keyframes themePop { 0% { transform: rotate(-90deg) scale(.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
```

---

## 5. Signature animations (Framer Motion + CSS)

Base easing everywhere: `const ease = [0.22, 0.61, 0.36, 1];`

**Rise-in (default reveal)** — every section child staggers up:
```jsx
const rise = { hidden: { opacity: 0, y: 34 }, show: (i=0) => ({ opacity: 1, y: 0,
  transition: { duration: .8, delay: i * .09, ease } }) };
// <motion.div variants={rise} custom={i} initial="hidden" whileInView="show" viewport={{ once:true, amount:.25 }}>
```

**Word-by-word blur reveal (hero headline):**
```jsx
text.split(" ").map((w, i) => (
  <motion.span key={i} style={{ display: "inline-block" }}
    initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: .7, delay: base + i * .09, ease }}>{w} </motion.span>
))
```

**Gradient text sweep** (key phrase in headline):
```css
.grad { background: linear-gradient(100deg, var(--blue) 10%, var(--cyan) 55%, var(--blue) 95%);
  background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: sweep 5s linear infinite; }
@keyframes sweep { to { background-position: 200% center; } }
```

**Equalizer bars (brand motif — use in live badges, empty states, hero):**
```css
.eq { display: inline-flex; align-items: flex-end; gap: 2.5px; height: 14px; }
.eq i { width: 3px; border-radius: 2px; background: var(--blue); height: 100%;
  transform-origin: bottom; animation: eqB 1s ease-in-out infinite; }
@keyframes eqB { 0%,100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
/* stagger via inline animationDelay: i * 0.13s */
```

**Magnetic button** (pulls toward cursor):
```jsx
function Magnetic({ children }) {
  const ref = useRef(null);
  const onMove = (e) => { const r = ref.current.getBoundingClientRect();
    ref.current.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.18}px, ${(e.clientY-r.top-r.height/2)*.22}px)`; };
  return <span ref={ref} onMouseMove={onMove} onMouseLeave={() => ref.current.style.transform = ""}
    style={{ display:"inline-block", transition:"transform .3s cubic-bezier(.22,.61,.36,1)" }}>{children}</span>;
}
```

**Button shine sweep on hover:**
```css
.btn-grad::after { content:""; position:absolute; inset:0;
  background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,.35) 50%, transparent 80%);
  transform: translateX(-110%); transition: transform .7s ease; }
.btn-grad:hover::after { transform: translateX(110%); }
```

**Mouse-spotlight card** (radial glow follows cursor):
```jsx
// onMouseMove: set --mx / --my custom props to cursor position within the card
```
```css
.cell::before { content:""; position:absolute; inset:0; opacity:0; transition:opacity .35s; pointer-events:none;
  background: radial-gradient(340px circle at var(--mx,50%) var(--my,50%), var(--glow), transparent 65%); }
.cell:hover::before { opacity:1; }
```

**Count-up stat** (animate 0 → value when scrolled into view, `animate()` from framer-motion).

**Scroll progress bar:**
```jsx
const { scrollYProgress } = useScroll();
const x = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: .4 });
<motion.div className="progress" style={{ scaleX: x }} />  // fixed top, 3px, var(--grad), origin left
```

**Marquee strip** (infinite scrolling keywords between thin borders):
```css
.marq-track { display:flex; gap:54px; width:max-content; animation: marq 26s linear infinite; }
@keyframes marq { to { transform: translateX(-50%); } }  /* duplicate content twice */
```

**Floating chips** (small glass cards hovering beside a hero panel):
```css
@keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-13px); } }
```

**SVG area chart draw-in:** `<motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}/>` over a `linearGradient` fill fading to transparent.

**Pulse dot (live indicators):**
```css
@keyframes pulse { 70% { box-shadow: 0 0 0 9px rgba(15,191,127,0); } 100% { box-shadow: 0 0 0 0 rgba(15,191,127,0); } }
```

**Aurora background** (fixed, behind everything): 2–3 giant blurred radial-gradient circles (`filter: blur(90px)`) in --glow and cyan tones, drifting slowly:
```css
@keyframes drift { to { transform: translate3d(60px,40px,0) scale(1.12); } }
```
Plus a faint grid overlay: 64px `linear-gradient` lines masked with a top-centered radial ellipse.

---

## 6. Component language

- **Radii:** cards 18–26px, buttons 12–14px, inputs 10–12px, pills/badges 20–40px. Generous rounding everywhere.
- **Buttons:** `.btn-grad` = gradient bg + glow shadow (`0 12px 32px var(--glow)`) + hover lift (-2px) + shine sweep. `.btn-soft` = bg-soft + 1px line border, hover → blue border/text.
- **Cards:** `var(--card)` bg, 1px `var(--line)` border, `--shadow-sm`, hover: lift -3px + `--shadow-md` (+ optional 3px gradient top bar fading in).
- **Glass panels:** `background: var(--glass); backdrop-filter: blur(20px) saturate(160%);` + line border. Use for nav, hero demo panel, auth cards.
- **Badges:** 11px 700, pill, tinted backgrounds: `rgba(color,.10–.14)` + solid color text.
- **Stat cards:** uppercase 12px label + icon chip, Space Grotesk 32px value, sub-line, optional animated gradient progress bar.
- **Nav links:** gradient underline that scales in from the left on hover (`transform-origin: left`).
- **Empty states:** never blank — icon chip with animated equalizer + bold one-liner + muted hint. Honest ("No calls yet"), never fake data.
- **Sidebar app-shell:** 250px, card bg, logo top, icon nav rows (active = gradient tint bg + 3px gradient left rail), plan card + theme toggle in footer.
- **Kanban board:** soft-bg columns, colored status dots, count pills, cards with hover-lift.
- **Chat/transcript bubbles:** AI = tinted blue gradient + blue border, left; user = bg-soft, right; 16px radius with 5px corner on the speaker side.
- **Dark hero/CTA box:** `linear-gradient(140deg, #0a1735, #12308f)` + glowing radial blobs in corners; white text.
- **Footer watermark:** giant wordmark (`clamp(120px, 21vw, 250px)`) as gradient-clipped ghost text overflowing the bottom.

---

## 7. Voice & principles

1. **Light AND dark, always.** Every component uses variables; test both themes.
2. **Motion has one accent.** Standard easing `[0.22,0.61,0.36,1]`, 0.5–0.8s reveals, 0.06–0.09s stagger. No bouncing chaos.
3. **Glow = brand.** Blue glow shadows on primary elements; stronger in dark mode.
4. **Honest data.** Empty states over mock numbers. Label anything sampled "Sample".
5. **One gradient.** blue→cyan (115deg) for CTAs, accents, progress. Don't invent new gradients.
6. **Copy tone:** short, confident, benefit-first. Headlines can break lines for rhythm ("Never miss a call. / Never lose a customer.").
