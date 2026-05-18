import { useState, useEffect, useRef } from "react";
import { Mail, Lock, User } from "lucide-react";
import { getWeightTilt, getHangOffset, getDropOffset } from "./physics.js";
import AnnoyingCaptcha from "./AnnoyingCaptcha.jsx";
import FloatingButton from "./FloatingButton.jsx";

const TERMS = [
  "1. We own your soul. Your cat's soul too. Non-negotiable.",
  "2. We will rename you. Probably Cumin. Accept it.",
  "3. Your password is bad and you should feel bad.",
  "4. If you laugh, 10% of it is ours.",
  "5. Food photos look better than the food. Always.",
  "6. No sharing with Karen. We know Karen.",
  "7. Disputes settled by dance-off. Floor 3. Near the broken printer.",
  "8. You get one haiku per year from us. You cannot stop the haiku.",
  "9. Reading this sentence means you accepted clauses 1–4000.",
  "10. The checkbox says 'I do not accept' and that is fine.",
];

const PREFILL = "Full name";
const POPUP_INTERVAL = 40;

function hasEmoji(str) {
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
  return emojiRegex.test(str);
}

const PW_RULES = [
  { get: () => "At least 10 characters.", test: (p) => p.length >= 10 },
  { get: () => "At least 1 Capital letter.", test: (p) => /[A-Z]/.test(p) },
  { get: () => "At least 1 Numeral.", test: (p) => /[0-9]/.test(p) },
  { get: (p, email) => "At least 1 letter from your email.", test: (p, email) => email.length > 0 && p.split("").some(c => /[a-zA-Z]/.test(c) && email.includes(c)) },
  { get: () => "At least 1 Cyrillic character.", test: (p) => /[\u0400-\u04FF]/.test(p) },
  { get: () => "At least 1 emoji 🙂", test: (p) => hasEmoji(p) },
  { get: () => "Must NOT contain the word 'password'.", test: (p) => !/password/i.test(p) },
];

// ── Weighted Input ─────────────────────────────────────────────────────────
function WeightedInput({ value, onChange, icon: Icon, placeholder, type = "text", inputStyle = {} }) {
  const tilt = getWeightTilt(value);
  const hangX = getHangOffset(value);
  const dropY = getDropOffset(value);
  const isHanging = hangX > 0;

  return (
    <div style={{
      position: "relative",
      transform: `rotate(${tilt}deg) translateX(${hangX}px) translateY(${dropY}px)`,
      transformOrigin: isHanging ? "left center" : "center bottom",
      transition: "transform 0.25s cubic-bezier(0.34,1.3,0.64,1)",
      zIndex: isHanging ? 10 : "auto",
      marginBottom: isHanging ? `${dropY + 10}px` : 0,
    }}>
      {Icon && (
        <Icon style={{
          position: "absolute", left: 14, top: "50%",
          transform: "translateY(-50%)", width: 16, height: 16, color: "#bbb", zIndex: 2
        }} />
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "#f5f1f1",
          border: "2px solid transparent",
          borderRadius: 100,
          paddingLeft: Icon ? 42 : 18,
          paddingRight: 16,
          paddingTop: 14,
          paddingBottom: 14,
          fontSize: "0.9rem",
          outline: "none",
          fontFamily: "inherit",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
          ...inputStyle,
        }}
      />
      {/* Weight indicator */}
      {value.length > 0 && (
        <div style={{
          position: "absolute", right: -30, top: "50%",
          transform: "translateY(-50%)",
          fontSize: "0.65rem", color: "#e63946",
          fontWeight: 800, fontFamily: "monospace",
          opacity: 0.7,
        }}>
          {value.length}kg
        </div>
      )}
    </div>
  );
}

export default function FoodyAuth() {
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showTerms, setShowTerms] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [popupOpen, setPopupOpen] = useState(true);
  const [secs, setSecs] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const lastPopupClose = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setSecs(s => {
        const next = s + 1;
        if (!popupOpen && next - lastPopupClose.current >= POPUP_INTERVAL) {
          setPopupOpen(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [popupOpen]);

  useEffect(() => {
    if (captchaPassed && pendingSubmit) {
      setPendingSubmit(false);
      finalizeSubmit();
    }
  }, [captchaPassed]);

  const closePopup = () => {
    setPopupOpen(false);
    lastPopupClose.current = secs;
  };

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const pwRulesPassed = PW_RULES.map(r => r.test(password, email));
  const allPwPassed = pwRulesPassed.every(Boolean);

  const validate = () => {
    const errs = {};
    if (isSignup && !name.trim()) errs.name = "That's literally not your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "That's not an email. That's abstract art.";
    if (!allPwPassed) errs.password = "Password doesn't meet our totally reasonable requirements.";
    if (isSignup && termsChecked) errs.terms = "Please accept the Terms & Conditions to continue.";
    return errs;
  };

  const handleSignUpClick = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!captchaPassed) {
      setPendingSubmit(true);
      setShowCaptcha(true);
      return;
    }
    finalizeSubmit();
  };

  const finalizeSubmit = () => {
    const u = { name: name || "mystery person", email };
    setUser(u);
    setLoggedIn(true);
  };

  const logout = () => {
    setUser(null); setLoggedIn(false);
    setName(""); setEmail(""); setPassword("");
    setErrors({}); setTermsChecked(false);
    setCaptchaPassed(false); setPendingSubmit(false);
  };

  const inp = {
    width: "100%", background: "#f5f1f1", border: "2px solid transparent",
    borderRadius: 100, paddingLeft: 42, paddingRight: 16,
    paddingTop: 14, paddingBottom: 14, fontSize: "0.9rem",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  const ico = {
    position: "absolute", left: 14, top: "50%",
    transform: "translateY(-50%)", width: 16, height: 16, color: "#bbb"
  };

  // ── Logged in ───────────────────────────────────────────────────────────
  if (loggedIn && user) return (
    <div style={{ minHeight: "100vh", background: "#f5f1f1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ background: "white", borderRadius: 32, padding: "2.5rem", maxWidth: 400, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.07)" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e63946", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: 28, color: "white", fontWeight: 800 }}>
          {user.name[0].toUpperCase()}
        </div>
        <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "1.8rem", margin: "0 0 4px" }}>F<span style={{ color: "#e63946" }}>oo</span>dy</p>
        <p style={{ color: "#aaa", fontSize: "0.8rem", marginBottom: "1.5rem", fontStyle: "italic" }}>You made it. We're genuinely surprised.</p>
        <div style={{ background: "#f5f1f1", borderRadius: 16, padding: "1.2rem", marginBottom: "1.5rem", textAlign: "left" }}>
          <p style={{ fontWeight: 700, margin: "0 0 2px" }}>{user.name}</p>
          <p style={{ color: "#888", fontSize: "0.85rem", margin: "0 0 10px" }}>{user.email}</p>
          <p style={{ color: "#aaa", fontSize: "0.75rem", margin: 0, fontStyle: "italic" }}>🧂 Codename: Cumin</p>
          <p style={{ color: "#aaa", fontSize: "0.75rem", margin: "4px 0 0", fontStyle: "italic" }}>⏱ Time wasted: {fmt(secs)}</p>
        </div>
        <button onClick={logout} style={{ background: "#e63946", color: "white", border: "none", borderRadius: 100, padding: "0.85rem 2rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
          Log out (bye Cumin)
        </button>
      </div>
    </div>
  );

  // ── Terms ───────────────────────────────────────────────────────────────
  if (showTerms) return (
    <div style={{ minHeight: "100vh", background: "#f5f1f1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ background: "white", borderRadius: 24, maxWidth: 460, width: "90%", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.09)" }}>
        <div style={{ padding: "1.5rem 1.5rem 0.75rem" }}>
          <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "1.3rem", margin: "0 0 4px" }}>Terms & Conditions</p>
          <p style={{ color: "#aaa", fontSize: "0.78rem", fontStyle: "italic", margin: 0 }}>We know you won't read this.</p>
        </div>
        <div style={{ height: 280, overflowY: "scroll", padding: "0.5rem 1.5rem 1rem" }}>
          {TERMS.map((t, i) => <p key={i} style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.75, marginBottom: "1rem" }}>{t}</p>)}
          <p style={{ color: "#ccc", fontSize: "0.72rem", textAlign: "center", fontStyle: "italic" }}>fin.</p>
        </div>
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f0ece8" }}>
          <button onClick={() => setShowTerms(false)} style={{ width: "100%", background: "#e63946", color: "white", border: "none", borderRadius: 100, padding: "0.8rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            I've suffered enough
          </button>
        </div>
      </div>
    </div>
  );

  // ── Main ────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{ minHeight: "100vh", background: "#f5f1f1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes popIn { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        input:focus { border-color: #e63946 !important; }
      `}</style>

      {/* CAPTCHA overlay */}
      {showCaptcha && (
        <AnnoyingCaptcha onVerified={() => { setCaptchaPassed(true); setShowCaptcha(false); }} />
      )}

      {/* Annoying timed popup */}
      {popupOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "2.5rem 3rem", textAlign: "center", maxWidth: 320, width: "90%", animation: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "1.35rem", margin: "0 0 6px" }}>Hurry up, time is ticking!</p>
            <p style={{ color: "#aaa", fontSize: "0.8rem", marginBottom: 16, fontStyle: "italic" }}>Your food is getting cold.<br />(We made that up.)</p>
            <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "#e63946", fontFamily: "monospace", marginBottom: 22 }}>{fmt(secs)}</div>
            <button onClick={closePopup} style={{ background: "#2ecc71", color: "white", border: "none", borderRadius: 100, padding: "0.75rem 2.5rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", display: "block", margin: "0 auto 14px", fontFamily: "inherit" }}>
              Lock
            </button>
            <span onClick={closePopup} style={{ fontSize: "0.68rem", color: "#ddd", cursor: "pointer", userSelect: "none" }}>©lose 2026</span>
          </div>
        </div>
      )}

      {/* ── Card ── */}
      <div style={{ width: "100%", maxWidth: 440, background: "white", borderRadius: 32, padding: "2.5rem 2.5rem 3.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign: "center", marginBottom: "0.6rem" }}>
          <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 800, color: "#e63946" }}>⏱ {fmt(secs)}</span>
          <span style={{ fontSize: "0.7rem", color: "#ccc", marginLeft: 6, fontStyle: "italic" }}>wasted</span>
        </div>
        <p style={{ textAlign: "center", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "2rem", margin: "0 0 4px" }}>
          F<span style={{ color: "#e63946" }}>oo</span>dy
        </p>
        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#aaa", marginBottom: "2rem" }}>
          {isSignup ? "Create your account" : "Welcome back, brave soul"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── Name — tilts with weight ── */}
          {isSignup && (
            <div style={{ overflow: "visible", paddingBottom: getDropOffset(name) > 0 ? getDropOffset(name) + 10 : 0 }}>
              <WeightedInput
                value={name}
                onChange={setName}
                icon={User}
                placeholder="Full name"
              />
              {errors.name && <p style={{ color: "#e63946", fontSize: "0.75rem", marginTop: 4, marginLeft: 14 }}>{errors.name}</p>}
            </div>
          )}

          {/* ── Email — tilts harder then hangs ── */}
          <div style={{ overflow: "visible", paddingBottom: getDropOffset(email) > 0 ? getDropOffset(email) + 10 : 0 }}>
            <WeightedInput
              value={email}
              onChange={setEmail}
              icon={Mail}
              placeholder="Email"
              type="email"
            />
            {errors.email && <p style={{ color: "#e63946", fontSize: "0.75rem", marginTop: 4, marginLeft: 14 }}>{errors.email}</p>}
          </div>

          {/* ── Password ── */}
          <div>
            <div style={{ position: "relative" }}>
              <Lock style={ico} />
              <div style={{ position: "absolute", inset: 0, background: "#f5f1f1", borderRadius: 100, zIndex: 0 }} />
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                paddingLeft: 42, paddingRight: 16, display: "flex", alignItems: "center",
                pointerEvents: "none", zIndex: 1, overflow: "hidden"
              }}>
                {password
                  ? <span style={{ display: "flex", alignItems: "center", gap: 1, lineHeight: 1 }}>
                    {[...password].map((ch, i) =>
                      hasEmoji(ch)
                        ? <span key={i} style={{ fontSize: "1rem" }}>{ch}</span>
                        : <span key={i} style={{ fontSize: "1.1rem", color: "#333" }}>•</span>
                    )}
                  </span>
                  : <span style={{ fontSize: "0.9rem", color: "#bbb" }}>Password</span>
                }
              </div>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                style={{ ...inp, color: "transparent", caretColor: "#333", position: "relative", zIndex: 2, background: "transparent" }}
              />
            </div>

            {password.length > 0 && (
              <div style={{ marginTop: 8, padding: "10px 14px", background: "#fff8f8", borderRadius: 12, border: "1px solid #fde" }}>
                {PW_RULES.map((r, i) => (
                  <p key={i} style={{ fontSize: "0.76rem", color: pwRulesPassed[i] ? "#2ecc71" : "#e63946", margin: "3px 0", fontStyle: "italic" }}>
                    {pwRulesPassed[i] ? "✓" : "✗"} {r.get(password, email)}
                  </p>
                ))}
              </div>
            )}
            {allPwPassed && password.length > 0 && (
              <p style={{ color: "#e63946", fontSize: "0.75rem", marginTop: 5, marginLeft: 14, fontStyle: "italic" }}>
                ⚠️ Your password is not unsafe. This worries us.
              </p>
            )}
            {errors.password && <p style={{ color: "#e63946", fontSize: "0.75rem", marginTop: 4, marginLeft: 14 }}>{errors.password}</p>}
          </div>

          {/* ── Backwards T&C ── */}
          {isSignup && (
            <div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: "0.85rem", color: "#555" }}>
                <input type="checkbox" checked={termsChecked} onChange={e => setTermsChecked(e.target.checked)}
                  style={{ marginTop: 3, accentColor: "#e63946", width: 15, height: 15, flexShrink: 0 }} />
                <span>
                  I do not accept the{" "}
                  <span onClick={e => { e.preventDefault(); setShowTerms(true); }} style={{ color: "#e63946", textDecoration: "underline", cursor: "pointer" }}>
                    Terms &amp; Conditions
                  </span>
                </span>
              </label>
              {errors.terms && (
                <p style={{ color: "#e63946", fontSize: "0.75rem", marginTop: 4, marginLeft: 26, animation: "shake 0.4s" }}>
                  Please do NOT forget to accept our terms and conditions.
                </p>
              )}
            </div>
          )}

          {/* Captcha status */}
          {captchaPassed && (
            <p style={{ fontSize: "0.75rem", color: "#2ecc71", margin: 0, fontWeight: 700 }}>
              ✅ You are probably human. Probably.
            </p>
          )}

          {/* Spacer so floating button doesn't overlap content */}
          <div style={{ height: 20 }} />
        </div>

        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#aaa", marginTop: "1rem" }}>
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <span onClick={() => { setIsSignup(!isSignup); setErrors({}); setName(""); setEmail(""); setPassword(""); setTermsChecked(false); }}
            style={{ color: "#e63946", fontWeight: 700, cursor: "pointer" }}>
            {isSignup ? "Log in" : "Sign up"}
          </span>
        </p>
      </div>

      {/* ── FLOATING SIGN UP BUTTON ── */}
      <FloatingButton
        label={isSignup ? "Sign Up" : "Log In"}
        onClick={handleSignUpClick}
        containerRef={containerRef}
      />
    </div>
  );
}