import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../foody/CartContext";
import {
  ArrowLeft, X, Plus, Minus, Trash2, Phone,
  Delete, CheckCircle2, AlertCircle, ShoppingBag,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   RAGE CURSOR — laggy, jittery, grows on click
═══════════════════════════════════════════════════════ */
const RageCursor = () => {
  const [size, setSize] = useState(16);
  const [pos, setPos] = useState({ x: -300, y: -300 });
  const [burst, setBurst] = useState(false);
  const realRef = useRef({ x: -300, y: -300 });
  const lagRef = useRef({ x: -300, y: -300 });
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => { realRef.current = { x: e.clientX, y: e.clientY }; };
    const onClick = () => {
      setSize(s => Math.min(s + 18, 180));
      setBurst(true);
      setTimeout(() => setBurst(false), 110);
    };
    const loop = () => {
      lagRef.current.x += (realRef.current.x - lagRef.current.x) * 0.038;
      lagRef.current.y += (realRef.current.y - lagRef.current.y) * 0.038;
      if (Math.random() < 0.18) {
        lagRef.current.x += (Math.random() - 0.5) * 10;
        lagRef.current.y += (Math.random() - 0.5) * 10;
      }
      setPos({ x: lagRef.current.x, y: lagRef.current.y });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div style={{
        position: "fixed", left: pos.x - size / 2, top: pos.y - size / 2,
        width: size, height: size, borderRadius: "50%",
        border: `${Math.max(2, size / 9)}px solid #e63946`,
        background: burst ? "rgba(230,57,70,0.18)" : "transparent",
        pointerEvents: "none", zIndex: 9999999,
        boxShadow: burst ? "0 0 14px rgba(230,57,70,0.5)" : "none",
      }} />
      <style>{`* { cursor: none !important; }`}</style>
    </>
  );
};

/* ═══════════════════════════════════════════════════════
   CART THIEF — big, funny, very visible, runs with legs
═══════════════════════════════════════════════════════ */
const CartThief = ({ itemName, onSteal, onDone }) => {
  const [phase, setPhase] = useState("enter"); // enter | pause | taunt | grab | flee | done
  const [stolen, setStolen] = useState(false);
  const [legAngle, setLegAngle] = useState(0);
  const legRaf = useRef(null);

  // Animate legs
  useEffect(() => {
    let t = 0;
    const loop = () => {
      t += 0.25;
      setLegAngle(Math.sin(t) * 35);
      legRaf.current = requestAnimationFrame(loop);
    };
    legRaf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(legRaf.current);
  }, []);

  useEffect(() => {
    // enter → pause
    const t1 = setTimeout(() => setPhase("pause"), 1100);
    // pause → taunt
    const t2 = setTimeout(() => setPhase("taunt"), 1900);
    // taunt → grab
    const t3 = setTimeout(() => setPhase("grab"), 3200);
    // grab → steal + flee
    const t4 = setTimeout(() => {
      if (!stolen) { setStolen(true); onSteal(); }
      setPhase("flee");
    }, 4000);
    // flee → done
    const t5 = setTimeout(() => { setPhase("done"); onDone(); }, 5400);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  const isRunning = phase === "enter" || phase === "flee";
  const xMap = {
    enter: "-100vw",
    pause: "calc(50vw - 80px)",
    taunt: "calc(50vw - 80px)",
    grab: "calc(50vw - 80px)",
    flee: "130vw",
    done: "130vw",
  };
  const durationMap = {
    enter: 1.1,
    pause: 0,
    taunt: 0,
    grab: 0,
    flee: 1.1,
    done: 0,
  };

  const taunts = ["😈 Your food is mine!", "🏃 YOINK!", "✌️ Thanks sucker!"];
  const [tauntIdx] = useState(() => Math.floor(Math.random() * taunts.length));

  return (
    <motion.div
      animate={{ x: xMap[phase] }}
      transition={{ duration: durationMap[phase], ease: phase === "flee" ? [0.3, 0, 0.8, 1] : [0, 0, 0.2, 1] }}
      style={{
        position: "fixed", bottom: 80, left: 0,
        zIndex: 9999800, pointerEvents: "none",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {(phase === "taunt" || phase === "grab") && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 16 }}
            style={{
              background: "white",
              borderRadius: 16,
              padding: "10px 16px",
              fontSize: "1rem",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              color: "#1a1a1a",
              whiteSpace: "nowrap",
              boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
              marginBottom: 10,
              position: "relative",
              border: "2px solid #e63946",
            }}
          >
            {phase === "grab" ? `🎒 Packing your ${itemName || "item"}...` : taunts[tauntIdx]}
            <div style={{
              position: "absolute", bottom: -11, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "10px solid #e63946",
            }} />
            <div style={{
              position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: "9px solid white",
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thief SVG — big, funny, expressive */}
      <svg width="100" height="130" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.35))",
          transform: phase === "flee" ? "scaleX(-1)" : "scaleX(1)",
          transition: "transform 0.1s",
        }}>

        {/* Shadow on ground */}
        <ellipse cx="50" cy="128" rx="28" ry="5" fill="rgba(0,0,0,0.12)" />

        {/* Body — striped like a cartoon burglar */}
        <rect x="26" y="52" width="48" height="44" rx="10" fill="#1a1a1a" />
        {/* Stripes on body */}
        <rect x="26" y="60" width="48" height="5" rx="2" fill="#2d2d2d" opacity="0.7" />
        <rect x="26" y="72" width="48" height="5" rx="2" fill="#2d2d2d" opacity="0.7" />
        <rect x="26" y="84" width="48" height="5" rx="2" fill="#2d2d2d" opacity="0.7" />

        {/* Head */}
        <circle cx="50" cy="36" r="24" fill="#1a1a1a" />

        {/* Beanie / hat */}
        <ellipse cx="50" cy="14" rx="22" ry="8" fill="#e63946" />
        <rect x="28" y="6" width="44" height="12" rx="4" fill="#e63946" />
        <circle cx="50" cy="6" r="5" fill="#ff6b6b" />

        {/* Face: whites of eyes */}
        <ellipse cx="40" cy="36" rx="8" ry="9" fill="white" />
        <ellipse cx="60" cy="36" rx="8" ry="9" fill="white" />

        {/* Pupils — shifty, looking sideways */}
        <circle cx={phase === "flee" ? "37" : "43"} cy="37" r="5" fill="#1a1a1a" />
        <circle cx={phase === "flee" ? "57" : "63"} cy="37" r="5" fill="#1a1a1a" />
        {/* Eye shine */}
        <circle cx={phase === "flee" ? "38" : "44"} cy="35" r="1.5" fill="white" />
        <circle cx={phase === "flee" ? "58" : "64"} cy="35" r="1.5" fill="white" />

        {/* Mouth — grin when grabbing, panic when fleeing */}
        {phase === "flee" ? (
          // Panicked open mouth
          <ellipse cx="50" cy="50" rx="7" ry="5" fill="#e63946" />
        ) : (
          // Evil grin
          <path d="M 38 50 Q 50 60 62 50" stroke="#e63946" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}

        {/* Eyebrows — angry/mischievous */}
        <line x1="33" y1="26" x2="46" y2="29" stroke="#e63946" strokeWidth="3" strokeLinecap="round" />
        <line x1="54" y1="29" x2="67" y2="26" stroke="#e63946" strokeWidth="3" strokeLinecap="round" />

        {/* Arms */}
        {/* Left arm */}
        <rect x="8" y="56" width="20" height="10" rx="5" fill="#1a1a1a"
          style={{ transformOrigin: "26px 61px", transform: `rotate(${phase === "grab" ? "20deg" : "0deg"})` }} />
        {/* Right arm — holding bag when fleeing */}
        <rect x="72" y="52" width="20" height="10" rx="5" fill="#1a1a1a"
          style={{ transformOrigin: "72px 57px", transform: `rotate(${phase === "flee" || phase === "grab" ? "-30deg" : "0deg"})` }} />

        {/* Stolen loot bag — appears on grab/flee */}
        {(phase === "grab" || phase === "flee") && (
          <g transform="translate(84, 35)">
            {/* Bag */}
            <rect x="0" y="0" width="30" height="26" rx="8" fill="#e63946" />
            {/* Bag handle */}
            <path d="M 6 0 Q 15 -10 24 0" stroke="#e63946" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Dollar sign on bag */}
            <text x="15" y="18" textAnchor="middle" fill="white" fontSize="14" fontWeight="900">💰</text>
            {/* Motion lines if fleeing */}
            {phase === "flee" && (
              <>
                <line x1="-5" y1="5" x2="-16" y2="5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                <line x1="-5" y1="13" x2="-20" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                <line x1="-5" y1="21" x2="-16" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              </>
            )}
          </g>
        )}

        {/* Legs — animated running */}
        {isRunning ? (
          <>
            <rect x="32" y="88" width="14" height="30" rx="6" fill="#111"
              style={{ transformOrigin: "39px 88px", transform: `rotate(${legAngle}deg)` }} />
            <rect x="54" y="88" width="14" height="30" rx="6" fill="#111"
              style={{ transformOrigin: "61px 88px", transform: `rotate(${-legAngle}deg)` }} />
            {/* Shoes */}
            <ellipse cx="39" cy="118" rx="10" ry="5" fill="#e63946"
              style={{ transformOrigin: "39px 88px", transform: `rotate(${legAngle}deg)` }} />
            <ellipse cx="61" cy="118" rx="10" ry="5" fill="#e63946"
              style={{ transformOrigin: "61px 88px", transform: `rotate(${-legAngle}deg)` }} />
          </>
        ) : (
          <>
            {/* Standing legs */}
            <rect x="32" y="88" width="14" height="30" rx="6" fill="#111" />
            <rect x="54" y="88" width="14" height="30" rx="6" fill="#111" />
            <ellipse cx="39" cy="118" rx="10" ry="5" fill="#e63946" />
            <ellipse cx="61" cy="118" rx="10" ry="5" fill="#e63946" />
          </>
        )}

        {/* Speed lines when running */}
        {phase === "flee" && (
          <>
            <line x1="-10" y1="65" x2="-40" y2="65" stroke="#e63946" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            <line x1="-10" y1="75" x2="-55" y2="75" stroke="#e63946" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <line x1="-10" y1="55" x2="-30" y2="55" stroke="#e63946" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          </>
        )}
      </svg>

      {/* Ground dust cloud when running */}
      {isRunning && (
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          style={{
            width: 60, height: 20,
            background: "radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            marginTop: -10,
          }}
        />
      )}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   STOLEN TOAST — ransom note style
═══════════════════════════════════════════════════════ */
const StolenToast = ({ itemName, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 5500); return () => clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{ x: 80, opacity: 0, rotate: 3 }}
      animate={{ x: 0, opacity: 1, rotate: [-2, 2, -1, 1, 0] }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 14 }}
      style={{
        position: "fixed", bottom: 28, right: 24, zIndex: 9999500,
        background: "#1a1a1a", color: "white", borderRadius: 16,
        padding: "1.25rem 1.4rem", maxWidth: 320,
        boxShadow: "0 12px 40px rgba(0,0,0,0.4), 0 0 0 3px #e63946",
        fontFamily: "'Nunito',sans-serif",
        border: "1px solid rgba(230,57,70,0.4)",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: "1.6rem" }}>🚨</span>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "1rem", color: "#e63946", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Active Heist!
        </p>
      </div>
      <p style={{ margin: "0 0 6px", fontSize: "0.9rem", lineHeight: 1.5 }}>
        A thief stole <strong style={{ color: "#e63946", background: "rgba(230,57,70,0.1)", padding: "1px 6px", borderRadius: 4 }}>1× {itemName}</strong> from your cart!
      </p>
      <p style={{ margin: "0 0 6px", fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>
        The perp has been identified as "unknown", wearing a red hat.
      </p>
      <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8 }}>
        🕵️ Case status: <span style={{ color: "#e63946" }}>UNSOLVED</span> · Authorities notified: <span style={{ color: "#e63946" }}>No</span>
      </p>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   STAGE CLEARED OVERLAY — briefly tells user what happened
═══════════════════════════════════════════════════════ */
const ThiefAlert = ({ onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999700,
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -5 }}
        animate={{ scale: [1.1, 1], rotate: [5, 0] }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
        style={{
          background: "#e63946",
          color: "white",
          borderRadius: 20,
          padding: "1.25rem 2rem",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 900,
          fontSize: "1.4rem",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(230,57,70,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        🏃💨 THIEF GETTING AWAY!
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   ANNOYING PHONE DIALPAD
   - Keys jump to random positions on the grid
   - Fake "wrong digit" appears occasionally  
   - Backspace is tiny and hard to find
   - Shows passive-aggressive feedback
═══════════════════════════════════════════════════════ */
const Dialpad = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState(null);
  const [flash, setFlash] = useState(null); // { key, wrong }
  const [annoyMsg, setAnnoyMsg] = useState("");
  const [wrongCount, setWrongCount] = useState(0);

  const annoyMessages = [
    "Are you sure that's right?",
    "Bold choice for digit " + (value.length + 1),
    "Hmm. If you say so.",
    "We're a little concerned.",
    "Your carrier may disagree.",
    "Interesting number so far.",
    "That's… a digit, yes.",
    "Keep going (we're scared)",
  ];

  const shuffleLayout = () => {
    const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫", "CLR"];
    // Keep digits shuffled but backspace buried (slot 0 or 1 = worst spot)
    const d = digits.slice(0, 10).sort(() => Math.random() - 0.5);
    const bury = Math.floor(Math.random() * 3); // ⌫ in first 3 slots
    d.splice(bury, 0, "⌫");
    d.splice(Math.floor(Math.random() * (d.length - 1)) + 6, 0, "CLR");
    return d.slice(0, 12);
  };

  const openPad = () => {
    setLayout(shuffleLayout());
    setOpen(true);
    setAnnoyMsg(annoyMessages[Math.floor(Math.random() * annoyMessages.length)]);
  };

  const press = (k) => {
    if (k === "⌫") {
      onChange(value.slice(0, -1));
      setLayout(shuffleLayout()); // re-shuffle after backspace
      return;
    }
    if (k === "CLR") {
      onChange("");
      setLayout(shuffleLayout());
      setAnnoyMsg("Wow. Starting over. Bold.");
      return;
    }
    // 20% chance a wrong digit flashes first
    if (Math.random() < 0.20 && wrongCount < 3) {
      const wrongDigit = String((parseInt(k) + 1 + Math.floor(Math.random() * 4)) % 10);
      setFlash({ key: k, wrong: wrongDigit });
      setWrongCount(wc => wc + 1);
      setTimeout(() => {
        setFlash(null);
        if (value.length < 13) onChange(value + k);
        setLayout(shuffleLayout());
        setAnnoyMsg(annoyMessages[Math.floor(Math.random() * annoyMessages.length)]);
      }, 600);
      return;
    }
    if (value.length < 13) onChange(value + k);
    setLayout(shuffleLayout()); // always re-shuffle after digit
    setAnnoyMsg(annoyMessages[Math.floor(Math.random() * annoyMessages.length)]);
  };

  return (
    <div>
      {/* Display */}
      <div style={{
        background: "white", border: "1px solid #e8e2e2", borderRadius: 12,
        padding: "0.75rem 1rem", marginBottom: "0.5rem",
        minHeight: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: "Georgia,serif", letterSpacing: "0.22em", fontSize: "1.05rem", color: "#1a1a1a", flex: 1 }}>
          {flash
            ? (
              <span>
                {value}
                <span style={{ color: "#e63946", fontWeight: 900 }}>{flash.wrong}</span>
                <span style={{ fontSize: "0.65rem", color: "#e63946", letterSpacing: 0, marginLeft: 4 }}>← oops?</span>
              </span>
            )
            : value || (
              <span style={{ color: "#c8c0c0", fontSize: "0.8rem", fontStyle: "italic", letterSpacing: 0, fontFamily: "inherit" }}>
                Open the pad — layout shuffles every tap
              </span>
            )}
        </span>
      </div>

      {/* Annoy message */}
      <AnimatePresence mode="wait">
        {annoyMsg && open && (
          <motion.p
            key={annoyMsg}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: "0.7rem", color: "#e63946", marginBottom: "0.4rem", fontStyle: "italic", minHeight: 18 }}
          >
            {annoyMsg}
          </motion.p>
        )}
      </AnimatePresence>

      {!open && (
        <p style={{ fontSize: "0.68rem", color: "#aaa", marginBottom: "0.5rem", fontStyle: "italic" }}>
          Keyboard disabled for security. Layout randomises every single digit. You're welcome.
        </p>
      )}

      <button onClick={openPad} style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "white", border: "1px solid #e8e2e2", borderRadius: 12,
        padding: "0.65rem 1rem", fontSize: "0.82rem",
        cursor: "pointer", fontFamily: "inherit", color: "#555", width: "100%",
      }}>
        <Phone size={14} style={{ color: "#e63946" }} />
        {open ? `Tap a digit (${13 - value.length} more max)` : "Open Dialpad"}
      </button>

      <AnimatePresence>
        {open && layout && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            style={{
              marginTop: "0.75rem", background: "#f9f6f6",
              border: "1px solid #e8e2e2", borderRadius: 16,
              padding: "1rem", boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
            }}>
            <p style={{ fontSize: "0.62rem", color: "#bbb", textAlign: "center", marginBottom: "0.75rem", fontStyle: "italic" }}>
              Layout reshuffles after every tap. ⌫ = backspace. It's somewhere in there.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {layout.map((k, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.82 }}
                  onClick={() => press(k)}
                  style={{
                    padding: "0.8rem 0",
                    borderRadius: 10,
                    border: "1px solid #e8e2e2",
                    background: k === "⌫" ? "#fff3f3"
                      : k === "CLR" ? "#fff0f0"
                        : "white",
                    color: k === "⌫" ? "#888"
                      : k === "CLR" ? "#e63946"
                        : "#1a1a1a",
                    fontSize: k === "⌫" || k === "CLR" ? "0.65rem" : "1.05rem",
                    fontWeight: k === "CLR" ? 800 : 500,
                    cursor: "pointer",
                    fontFamily: "Georgia,serif",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    // Make backspace visually smaller/harder to notice
                    opacity: k === "⌫" ? 0.55 : 1,
                    transform: k === "⌫" ? "scale(0.88)" : "scale(1)",
                  }}>
                  {k === "⌫" ? <Delete size={13} /> : k}
                </motion.button>
              ))}
            </div>
            {wrongCount > 0 && (
              <p style={{ fontSize: "0.62rem", color: "#e63946", textAlign: "center", marginTop: "0.6rem", fontStyle: "italic" }}>
                {wrongCount}× misfire{wrongCount > 1 ? "s" : ""} detected. Fat fingers? No judgment.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SHARED STYLES
═══════════════════════════════════════════════════════ */
const inputStyle = {
  width: "100%", background: "#f9f7f7", border: "1px solid #ede8e8",
  borderRadius: 12, padding: "0.8rem 1rem", fontSize: "0.9rem",
  color: "#1a1a1a", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const cardStyle = {
  background: "white", borderRadius: 20, padding: "1.75rem",
  boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #ede8e8",
};

const sectionTitle = {
  fontFamily: "Georgia,serif", fontSize: "1.1rem", color: "#1a1a1a",
  margin: "0 0 1.25rem", fontWeight: 600,
};

/* ═══════════════════════════════════════════════════════
   MAIN CHECKOUT PAGE
═══════════════════════════════════════════════════════ */
const FoodyCheckout = () => {
  const navigate = useNavigate();
  const { items, updateQty, removeFromCart, total, clearCart } = useCart();
  const [showThief, setShowThief] = useState(false);
  const [stolenItem, setStolenItem] = useState(null);
  const [showStolenToast, setShowStolenToast] = useState(false);
  const [showThiefAlert, setShowThiefAlert] = useState(false);
  const [thiefFired, setThiefFired] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [payMethod, setPayMethod] = useState("card");

  const [form, setForm] = useState({
    name: "", street: "", city: "", zip: "",
    phone: "", email: "",
    cardNum: "", expiry: "", cvv: "",
  });

  // Fire thief after 12 seconds, only once, only if cart has items
  useEffect(() => {
    if (thiefFired || items.length === 0) return;
    const t = setTimeout(() => {
      setThiefFired(true);
      setShowThiefAlert(true);
      setTimeout(() => setShowThief(true), 400);
    }, 12000);
    return () => clearTimeout(t);
  }, [thiefFired, items.length]);

  const handleSteal = useCallback(() => {
    if (items.length === 0) return;
    const target = items[Math.floor(Math.random() * items.length)];
    setStolenItem(target.name);
    if (target.qty > 1) {
      updateQty(target.id, target.qty - 1);
    } else {
      removeFromCart(target.id);
    }
    setShowStolenToast(true);
  }, [items, updateQty, removeFromCart]);

  const field = (key, placeholder, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = "#e63946"}
      onBlur={e => e.target.style.borderColor = "#ede8e8"}
    />
  );

  const canPlace = form.name && form.street && form.city &&
    form.zip && form.phone.length >= 6 && form.email.includes("@");

  const placeOrder = () => {
    if (!canPlace) return;
    setPlacing(true);
    setTimeout(() => { setPlacing(false); setPlaced(true); clearCart(); }, 2800);
  };

  const subtotal = total;
  const delivery = 4.99;
  const grandTotal = (subtotal + delivery).toFixed(2);

  /* ── Order Placed Screen ────────────────────────── */
  if (placed) return (
    <>
      <RageCursor />
      <div style={{
        minHeight: "100vh", background: "#f5f1f1",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Nunito',-apple-system,sans-serif", padding: "2rem",
      }}>
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: "center", maxWidth: 440 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e63946", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", boxShadow: "0 8px 24px rgba(230,57,70,0.3)" }}>
              <CheckCircle2 size={36} style={{ color: "white" }} />
            </div>
          </motion.div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#1a1a1a", margin: "0 0 0.75rem" }}>Order Placed.</h2>
          <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "0.5rem" }}>
            Your food is being prepared by someone who definitely washed their hands.
          </p>
          <p style={{ color: "#bbb", fontSize: "0.76rem", fontStyle: "italic", marginBottom: "2rem" }}>
            Estimated delivery: 30–45 minutes. Or longer. Or shorter. We'll see.
          </p>
          <button onClick={() => navigate("/foody")}
            style={{ background: "#e63946", color: "white", border: "none", borderRadius: 100, padding: "0.85rem 2.5rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(230,57,70,0.25)" }}>
            Back to Foody
          </button>
        </motion.div>
      </div>
    </>
  );

  /* ── Main Checkout ──────────────────────────────── */
  return (
    <>
      <RageCursor />

      {/* "THIEF GETTING AWAY" flash */}
      <AnimatePresence>
        {showThiefAlert && (
          <ThiefAlert onDone={() => setShowThiefAlert(false)} />
        )}
      </AnimatePresence>

      {/* Thief animation */}
      <AnimatePresence>
        {showThief && (
          <CartThief
            itemName={stolenItem || (items[0]?.name ?? "something")}
            onSteal={handleSteal}
            onDone={() => setShowThief(false)}
          />
        )}
      </AnimatePresence>

      {/* Stolen toast */}
      <AnimatePresence>
        {showStolenToast && (
          <StolenToast
            itemName={stolenItem}
            onDone={() => setShowStolenToast(false)}
          />
        )}
      </AnimatePresence>

      <div style={{
        minHeight: "100vh", background: "#f5f1f1",
        fontFamily: "'Nunito',-apple-system,sans-serif",
      }}>
        {/* Top bar */}
        <div style={{ borderBottom: "1px solid #ede8e8", background: "rgba(245,241,241,0.92)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => navigate("/foody")}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "0.85rem", fontFamily: "inherit" }}>
              <ArrowLeft size={15} /> Back to menu
            </button>
            <span style={{ fontFamily: "Georgia,serif", fontSize: "1.05rem", color: "#1a1a1a", fontStyle: "italic", marginLeft: "auto" }}>
              F<span style={{ color: "#e63946" }}>oo</span>dy — Checkout
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "2.4rem", color: "#1a1a1a", margin: "0 0 2rem", fontWeight: 700 }}>
            Checkout
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start" }}>

            {/* ── Left column ─────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Delivery Address */}
              <div style={cardStyle}>
                <p style={sectionTitle}>Delivery Address</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {field("name", "Full name")}
                  {field("email", "Email address", "email")}
                  {field("street", "Street address")}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {field("city", "City")}
                    {field("zip", "ZIP / Postal code")}
                  </div>
                </div>
              </div>

              {/* Phone — annoying dialpad */}
              <div style={cardStyle}>
                <p style={sectionTitle}>Phone Number</p>
                <Dialpad value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
              </div>

              {/* Payment */}
              <div style={cardStyle}>
                <p style={sectionTitle}>Payment Method</p>
                <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
                  {["card", "paypal", "cash"].map(m => (
                    <button key={m} onClick={() => setPayMethod(m)}
                      style={{
                        flex: 1, padding: "0.65rem 0", borderRadius: 100,
                        border: payMethod === m ? "none" : "1px solid #e8e2e2",
                        background: payMethod === m ? "#e63946" : "white",
                        color: payMethod === m ? "white" : "#777",
                        fontSize: "0.82rem", fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                        textTransform: "capitalize",
                        transition: "all 0.15s",
                      }}>
                      {m === "card" ? "Card" : m === "paypal" ? "PayPal" : "Cash"}
                    </button>
                  ))}
                </div>

                {payMethod === "card" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input placeholder="Card number" value={form.cardNum}
                      onChange={e => setForm(f => ({ ...f, cardNum: e.target.value.replace(/\D/g, "").slice(0, 16) }))}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#e63946"}
                      onBlur={e => e.target.style.borderColor = "#ede8e8"} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <input placeholder="MM / YY" value={form.expiry}
                        onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "#e63946"}
                        onBlur={e => e.target.style.borderColor = "#ede8e8"} />
                      <input placeholder="CVV" value={form.cvv} maxLength={4}
                        onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, "") }))}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "#e63946"}
                        onBlur={e => e.target.style.borderColor = "#ede8e8"} />
                    </div>
                  </div>
                )}

                {payMethod === "paypal" && (
                  <div style={{ background: "#f9f7f7", borderRadius: 12, padding: "1rem", textAlign: "center", border: "1px solid #ede8e8" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#555", fontStyle: "italic" }}>
                      You'll be redirected to PayPal. Or so we say.
                    </p>
                  </div>
                )}

                {payMethod === "cash" && (
                  <div style={{ background: "#f9f7f7", borderRadius: 12, padding: "1rem", border: "1px solid #ede8e8" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>
                      Pay at the door. Please have exact change. The driver dislikes math.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right column — Order summary ─────── */}
            <div style={{ position: "sticky", top: 88 }}>
              <div style={cardStyle}>
                <p style={sectionTitle}>Order Summary</p>

                {/* Stolen banner */}
                <AnimatePresence>
                  {showStolenToast && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      style={{ background: "#fff0f0", border: "1px solid #f5c5c5", borderRadius: 10, padding: "0.6rem 0.9rem", marginBottom: "1rem", fontSize: "0.78rem", color: "#b0272c", display: "flex", alignItems: "center", gap: 6 }}>
                      <AlertCircle size={13} />
                      1 item was stolen. We're looking into it.
                    </motion.div>
                  )}
                </AnimatePresence>

                {items.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <ShoppingBag size={32} style={{ color: "#ddd", margin: "0 auto 0.75rem" }} />
                    <p style={{ color: "#bbb", fontSize: "0.85rem", fontStyle: "italic" }}>Cart is empty.</p>
                    <p style={{ color: "#ddd", fontSize: "0.72rem", fontStyle: "italic" }}>
                      (A thief may be responsible.)
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: "1.25rem" }}>
                    {items.map(item => (
                      <motion.div key={item.id} layout
                        style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img src={item.image} alt={item.name}
                          style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid #ede8e8" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#888" }}>${item.price.toFixed(2)}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          <button onClick={() => updateQty(item.id, item.qty - 1)}
                            style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #e8e2e2", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: "0.88rem", fontWeight: 600, minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty + 1)}
                            style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #e8e2e2", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <Plus size={12} />
                          </button>
                          <button onClick={() => removeFromCart(item.id)}
                            style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginLeft: 2 }}>
                            <Trash2 size={12} style={{ color: "#e63946" }} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Totals */}
                <div style={{ borderTop: "1px solid #f0ecea", paddingTop: "1.1rem", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#888" }}>
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#888" }}>
                    <span>Delivery</span>
                    <span>${delivery.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 700, color: "#1a1a1a", marginTop: 4 }}>
                    <span>Total</span>
                    <span>${grandTotal}</span>
                  </div>
                </div>

                {/* Place Order button */}
                <button
                  onClick={placeOrder}
                  disabled={!canPlace || placing || items.length === 0}
                  style={{
                    width: "100%", marginTop: "1.25rem",
                    background: canPlace && !placing && items.length > 0 ? "#e63946" : "#e0dada",
                    color: "white", border: "none", borderRadius: 100,
                    padding: "0.95rem", fontSize: "0.95rem", fontWeight: 700,
                    cursor: canPlace && !placing && items.length > 0 ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                    boxShadow: canPlace ? "0 4px 18px rgba(230,57,70,0.28)" : "none",
                    transition: "background 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                  {placing ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                      Placing…
                    </>
                  ) : "Place Order"}
                </button>

                {!canPlace && items.length > 0 && (
                  <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#bbb", marginTop: "0.6rem", fontStyle: "italic" }}>
                    Fill in all fields to continue.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodyCheckout;