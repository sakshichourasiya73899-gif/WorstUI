import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  History, 
  HelpCircle,
  ShieldAlert,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import { getWeightTilt, getHangOffset, getDropOffset } from "../foody/Physics.js";
import AnnoyingCaptcha from "../foody/AnnoyingCaptcha.jsx";
import FloatingButton from "../foody/FloatingButton.jsx";

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

const PW_RULES = [
  { get: () => "At least 10 characters.", test: (p) => p.length >= 10 },
  { get: () => "At least 1 Capital letter.", test: (p) => /[A-Z]/.test(p) },
  { get: () => "At least 1 Numeral.", test: (p) => /[0-9]/.test(p) },
  { get: (p, email) => "At least 1 letter from your email.", test: (p, email) => email.length > 0 && p.split("").some(c => /[a-zA-Z]/.test(c) && email.includes(c)) },
  { get: () => "At least 1 Cyrillic character.", test: (p) => /[\u0400-\u04FF]/.test(p) },
  { get: () => "At least 1 special character.", test: (p) => /[^a-zA-Z0-9]/.test(p) },
  { get: () => "Must NOT contain the word 'password'.", test: (p) => !/password/i.test(p) },
];

// ── Weighted Input ─────────────────────────────────────────────────────────
function WeightedInput({ value, onChange, icon: Icon, placeholder, type = "text", inputStyle = {}, isSignupEmail = false, error = "" }) {
  const tilt = getWeightTilt(value);
  const hangX = getHangOffset(value);
  const dropY = getDropOffset(value);
  const isHanging = hangX > 0;

  const activeAbsolute = isSignupEmail && isHanging;
  const baseRotation = activeAbsolute ? 90 : 0;

  return (
    <div style={{
      position: "relative",
      height: isSignupEmail ? 52 : "auto", // Reserve height if signup email so layout doesn't snap
      marginBottom: !isSignupEmail && isHanging ? `${dropY + 10}px` : 0,
    }}>
      <div style={{
        position: activeAbsolute ? "absolute" : "relative",
        right: activeAbsolute ? "-210px" : "auto",
        top: activeAbsolute ? "0px" : "auto",
        width: activeAbsolute ? "260px" : "100%",
        transform: `rotate(${baseRotation + tilt}deg) translateX(${hangX}px) translateY(${dropY}px)`,
        transformOrigin: activeAbsolute ? "0 0" : (isHanging ? "left center" : "center bottom"),
        transition: "transform 0.25s cubic-bezier(0.34,1.3,0.64,1), right 0.25s, top 0.25s, width 0.25s",
        zIndex: activeAbsolute || isHanging ? 100 : "auto",
        boxShadow: activeAbsolute ? "0 15px 35px rgba(0,0,0,0.08)" : "none",
        borderRadius: activeAbsolute ? 100 : "none",
        background: activeAbsolute ? "white" : "transparent",
        padding: activeAbsolute ? "2px" : 0,
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
            background: activeAbsolute ? "white" : "#f5f1f1",
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
        {error && (
          <p style={{
            color: "#e63946",
            fontSize: "0.75rem",
            marginTop: 4,
            marginLeft: 14,
            textAlign: "left",
            whiteSpace: "nowrap"
          }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function FoodyAuth() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  // Terms and Crank state
  const [showTerms, setShowTerms] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [crankAngle, setCrankAngle] = useState(0);
  const [hasCrankedToBottom, setHasCrankedToBottom] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(0); // 0 = closed, 1 = enter email, 2 = 3s hold verify, 3 = choose password
  const [forgotError, setForgotError] = useState("");
  const [holdProgress, setHoldProgress] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(0);
  
  const [popupOpen, setPopupOpen] = useState(true);
  const [secs, setSecs] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  
  const lastPopupClose = useRef(0);
  const containerRef = useRef(null);
  const termsContainerRef = useRef(null);
  const dragRef = useRef({ isDragging: false, lastAngle: 0 });

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

  // Hand crank dragging effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragRef.current.isDragging) return;
      const { centerX, centerY, lastAngle } = dragRef.current;
      
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (clientX === undefined || clientY === undefined) return;
      
      const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
      let delta = currentAngle - lastAngle;
      
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      
      if (termsContainerRef.current) {
        const scrollAmt = delta * 60; 
        termsContainerRef.current.scrollTop += scrollAmt;
        
        // Check if reached bottom
        const scrolled = termsContainerRef.current.scrollTop;
        const total = termsContainerRef.current.scrollHeight - termsContainerRef.current.clientHeight;
        if (scrolled >= total - 5) {
          setHasCrankedToBottom(true);
        }
      }
      
      setCrankAngle((prev) => prev + (delta * 180) / Math.PI);
      dragRef.current.lastAngle = currentAngle;
    };
    
    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove);
    window.addEventListener("touchend", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  const handleCrankMouseDown = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    dragRef.current = {
      isDragging: true,
      centerX,
      centerY,
      lastAngle: Math.atan2(clientY - centerY, clientX - centerX),
    };
  };

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
    
    if (isSignup) {
      if (!allPwPassed) {
        errs.password = "Password doesn't meet our totally reasonable requirements.";
      }
    } else {
      if (!password) {
        errs.password = "Please enter your password.";
      }
    }
    
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
    const u = { name: isSignup ? (name || "Cumin") : "Cumin", email };
    
    // Manage database in localStorage
    const usersStr = localStorage.getItem("users");
    const users = usersStr ? JSON.parse(usersStr) : [];
    
    if (isSignup) {
      const exists = users.find(x => x.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setErrors({ email: "Account already exists with this email address." });
        return;
      }
      users.push({ name: name || "Cumin", email, password });
      localStorage.setItem("users", JSON.stringify(users));
    } else {
      const found = users.find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
      if (!found) {
        setErrors({ password: "No account with those credentials found." });
        return;
      }
      u.name = found.name;
    }

    localStorage.setItem("currentUser", JSON.stringify(u));
    navigate("/foody");
    window.location.reload(); // Refresh to update Navbar State
  };

  const handleForgotPassword = () => {
    setForgotError("");
    setForgotEmail(email);
    setForgotStep(1);
    setShowForgotPassword(true);
  };

  const handleHoldStart = (e) => {
    e.preventDefault();
    setForgotError("");
    holdStartRef.current = Date.now();
    holdTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - holdStartRef.current) / 1000;
      setHoldProgress(Math.min(elapsed / 3.0, 1));
    }, 50);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    const elapsed = (Date.now() - holdStartRef.current) / 1000;
    setHoldProgress(0);
    
    if (elapsed >= 2.85 && elapsed <= 3.15) {
      setForgotStep(3);
      setForgotError("");
    } else {
      setForgotError(`Failed! You held for ${elapsed.toFixed(2)}s. We need exactly 3.00s (with ±0.15s tolerance).`);
    }
  };

  const handleResetPasswordSubmit = () => {
    setForgotError("");
    if (newPassword.length < 4) {
      setForgotError("❌ New password must be at least 4 characters.");
      return;
    }

    const usersStr = localStorage.getItem("users");
    const users = usersStr ? JSON.parse(usersStr) : [];

    const matchingUser = users.find(u => u.password === newPassword);
    if (matchingUser) {
      setForgotError(`❌ This password is already used by ${matchingUser.name}!`);
      return;
    }

    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === forgotEmail.toLowerCase()) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    setResetSuccess(true);
    setTimeout(() => {
      setForgotStep(0);
      setShowForgotPassword(false);
      setForgotEmail("");
      setNewPassword("");
      setResetSuccess(false);
      setForgotError("");
    }, 2500);
  };

  const inp = {
    width: "100%", background: "#f5f1f1", border: "2px solid transparent",
    borderRadius: 100, paddingLeft: 42, paddingRight: 48,
    paddingTop: 14, paddingBottom: 14, fontSize: "0.9rem",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  const ico = {
    position: "absolute", left: 14, top: "50%",
    transform: "translateY(-50%)", width: 16, height: 16, color: "#bbb",
    zIndex: 3 // Set high z-index to overlay on top of background div
  };

  // ── Terms ───────────────────────────────────────────────────────────────
  if (showTerms) return (
    <div style={{ minHeight: "100vh", background: "#f5f1f1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ background: "white", borderRadius: 24, maxWidth: 460, width: "90%", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.09)" }}>
        <div style={{ padding: "1.5rem 1.5rem 0.75rem" }}>
          <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "1.3rem", margin: "0 0 4px" }}>Terms & Conditions</p>
          <p style={{ color: "#aaa", fontSize: "0.78rem", fontStyle: "italic", margin: 0 }}>We know you won't read this.</p>
        </div>
        
        {/* Scrollable Terms Area — normal scroll is hidden! */}
        <div 
          ref={termsContainerRef}
          style={{ 
            height: 250, 
            overflowY: "hidden", 
            padding: "0.5rem 1.5rem 1rem",
            userSelect: "none"
          }}
        >
          {TERMS.map((t, i) => <p key={i} style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.75, marginBottom: "1rem" }}>{t}</p>)}
          <p style={{ color: "#ccc", fontSize: "0.72rem", textAlign: "center", fontStyle: "italic" }}>fin.</p>
        </div>

        {/* Hand Crank lever mechanism */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "1rem 0 1.5rem",
          userSelect: "none"
        }}>
          <p style={{ fontSize: "0.72rem", color: "#888", fontWeight: 700, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Spin crank lever to scroll
          </p>
          
          <div 
            onMouseDown={handleCrankMouseDown}
            onTouchStart={handleCrankMouseDown}
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "radial-gradient(circle, #fcfcfc 0%, #ebebeb 70%, #d6d6d6 100%)",
              border: "4px solid #fff",
              boxShadow: "inset 0 4px 10px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.05)",
              position: "relative",
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#e63946",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              zIndex: 2,
            }} />
            
            <div style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 6,
              height: 38,
              background: "linear-gradient(to top, #3a86ff, #007bff)",
              transformOrigin: "50% 0%",
              transform: `translate(-50%, 0%) rotate(${crankAngle}deg)`,
              borderRadius: 3,
              boxShadow: "0 2px 6px rgba(0,123,255,0.2)",
              zIndex: 1,
            }}>
              <div style={{
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "radial-gradient(circle, #fff 30%, #3a86ff 100%)",
                border: "2px solid #007bff",
                boxShadow: "0 3px 6px rgba(0,0,0,0.12)",
                cursor: "pointer",
              }} />
            </div>
          </div>
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f0ece8" }}>
          <button 
            disabled={!hasCrankedToBottom}
            onClick={() => setShowTerms(false)} 
            style={{ 
              width: "100%", 
              background: hasCrankedToBottom ? "#e63946" : "#ccc", 
              color: "white", 
              border: "none", 
              borderRadius: 100, 
              padding: "0.85rem", 
              fontSize: "0.9rem", 
              fontWeight: 700, 
              cursor: hasCrankedToBottom ? "pointer" : "not-allowed", 
              fontFamily: "inherit" 
            }}
          >
            {hasCrankedToBottom ? "I've suffered enough" : "Read to bottom using crank first"}
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
            <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "#e63946", fontFamily: "monospace", marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Clock size={28} /> {fmt(secs)}
            </div>
            <button onClick={closePopup} style={{ background: "#2ecc71", color: "white", border: "none", borderRadius: 100, padding: "0.75rem 2.5rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", display: "block", margin: "0 auto 14px", fontFamily: "inherit" }}>
              Lock
            </button>
            <span onClick={closePopup} style={{ fontSize: "0.68rem", color: "#ddd", cursor: "pointer", userSelect: "none" }}>©lose 2026</span>
          </div>
        </div>
      )}

      {/* ── Card ── */}
      <div style={{ 
        width: "100%", 
        maxWidth: 440, 
        background: "white", 
        borderRadius: 32, 
        padding: "2.5rem 2.5rem 3.5rem", 
        boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "visible"
      }}>
        <div style={{ textAlign: "center", marginBottom: "0.6rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 800, color: "#e63946" }}>
            <History size={16} /> {fmt(secs)}
          </span>
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

          {/* ── Email — tilts, slides, and hangs vertically if Signup ── */}
          <div style={{ overflow: "visible", position: "relative" }}>
            <WeightedInput
              value={email}
              onChange={setEmail}
              icon={Mail}
              placeholder="Email"
              type="email"
              isSignupEmail={isSignup}
              error={errors.email}
            />
          </div>

          {/* ── Password ── */}
          <div>
            <div style={{ position: "relative" }}>
              <Lock style={ico} />
              <div style={{ position: "absolute", inset: 0, background: "#f5f1f1", borderRadius: 100, zIndex: 0 }} />
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                paddingLeft: 42, paddingRight: 48, display: "flex", alignItems: "center",
                pointerEvents: "none", zIndex: 1, overflow: "hidden"
              }}>
                {password
                  ? <span style={{ display: "flex", alignItems: "center", gap: 1, lineHeight: 1 }}>
                    {[...password].map((ch, i) =>
                      <span key={i} style={{ fontSize: "0.95rem", color: "#333", fontWeight: 700 }}>
                        {showPassword ? ch : "•"}
                      </span>
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
              
              {/* Show/Hide password toggle button */}
              {password.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#bbb",
                    cursor: "pointer",
                    zIndex: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    outline: "none",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>

            {isSignup && password.length > 0 && (
              <div style={{ marginTop: 8, padding: "10px 14px", background: "#fff8f8", borderRadius: 12, border: "1px solid #fde" }}>
                {PW_RULES.map((r, i) => (
                  <p key={i} style={{ fontSize: "0.76rem", color: pwRulesPassed[i] ? "#2ecc71" : "#e63946", margin: "3px 0", fontStyle: "italic", display: "flex", alignItems: "center", gap: 6 }}>
                    {pwRulesPassed[i] ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {r.get(password, email)}
                  </p>
                ))}
              </div>
            )}
            {isSignup && allPwPassed && password.length > 0 && (
              <p style={{ color: "#e63946", fontSize: "0.75rem", marginTop: 5, marginLeft: 14, fontStyle: "italic", display: "flex", alignItems: "center", gap: 4 }}>
                <AlertTriangle size={13} /> Your password is not unsafe. This worries us.
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
            <p style={{ fontSize: "0.75rem", color: "#2ecc71", margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={14} /> You are probably human. Probably.
            </p>
          )}

          {/* Container holding the Floating Button in its right position */}
          <div style={{ height: 52, marginTop: 24, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
            <FloatingButton
              label={isSignup ? "Sign Up" : "Log In"}
              onClick={handleSignUpClick}
              containerRef={containerRef}
            />
          </div>
        </div>

        {/* Forgot password in Login view */}
        {!isSignup && (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <span 
              onClick={handleForgotPassword}
              style={{ color: "#e63946", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
            >
              Forgot your password?
            </span>
            
            {showForgotPassword && (
              <div style={{
                marginTop: 16,
                background: "#fff5f5",
                border: "2px dashed #e63946",
                borderRadius: 16,
                padding: "1.2rem",
                fontSize: "0.85rem",
                color: "#333",
                textAlign: "left",
                animation: "fadeInMsg 0.3s ease",
                boxSizing: "border-box"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, color: "#e63946", fontSize: "0.9rem" }}>🔑 Password recovery assistant</span>
                  <span 
                    onClick={() => { setForgotStep(0); setShowForgotPassword(false); }}
                    style={{ color: "#aaa", cursor: "pointer", fontSize: "1.2rem", fontWeight: 700 }}
                  >
                    ×
                  </span>
                </div>

                {/* Step 1: Verify Email */}
                {forgotStep === 1 && (
                  <div>
                    <p style={{ margin: "0 0 10px", color: "#666", fontSize: "0.8rem" }}>Enter the registered email associated with your spice cabinet:</p>
                    <input 
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="email@foody.com"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 100, border: "2px solid #e63946",
                        outline: "none", fontSize: "0.85rem", background: "white", boxSizing: "border-box"
                      }}
                    />
                    <button
                      onClick={() => {
                        setForgotError("");
                        const usersStr = localStorage.getItem("users");
                        const users = usersStr ? JSON.parse(usersStr) : [];
                        const found = users.find(x => x.email.toLowerCase() === forgotEmail.toLowerCase());
                        if (found) {
                          setForgotStep(2);
                        } else {
                          setForgotError("❌ Email not found in our registry.");
                        }
                      }}
                      style={{
                        marginTop: 12, background: "#e63946", color: "white", border: "none",
                        borderRadius: 100, padding: "8px 20px", fontSize: "0.8rem", fontWeight: 700,
                        cursor: "pointer", width: "100%"
                      }}
                    >
                      Next Step
                    </button>
                  </div>
                )}

                {/* Step 2: 3-Second Hold Verification */}
                {forgotStep === 2 && (
                  <div>
                    <p style={{ margin: "0 0 10px", color: "#666", fontSize: "0.8rem" }}>
                      Prove your organic, non-robotic origin. <b>Hold down</b> the button for exactly <b>3.00 seconds</b> (±0.15s tolerance):
                    </p>
                    
                    <div style={{ background: "#eee", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
                      <div style={{ background: "#e63946", height: "100%", width: `${holdProgress * 100}%` }} />
                    </div>

                    <button
                      onMouseDown={handleHoldStart}
                      onMouseUp={handleHoldEnd}
                      onTouchStart={handleHoldStart}
                      onTouchEnd={handleHoldEnd}
                      style={{
                        background: "#333", color: "white", border: "none",
                        borderRadius: 100, padding: "12px 20px", fontSize: "0.85rem", fontWeight: 800,
                        cursor: "pointer", width: "100%", textAlign: "center", userSelect: "none"
                      }}
                    >
                      {holdProgress > 0 ? "HOLDING... RELEASE AT 3s!" : "HOLD ME FOR 3 SECONDS"}
                    </button>
                  </div>
                )}

                {/* Step 3: Enter New Password */}
                {forgotStep === 3 && (
                  <div>
                    {resetSuccess ? (
                      <div style={{ textAlign: "center", padding: "1rem 0" }}>
                        <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#2ecc71" }}>✓ Verification successful!</p>
                        <p style={{ margin: 0, fontStyle: "italic", color: "#888" }}>Updating chef registry database...</p>
                      </div>
                    ) : (
                      <div>
                        <p style={{ margin: "0 0 10px", color: "#666", fontSize: "0.8rem" }}>Enter your desired new password:</p>
                        <input 
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Unique password"
                          style={{
                            width: "100%", padding: "10px 14px", borderRadius: 100, border: "2px solid #e63946",
                            outline: "none", fontSize: "0.85rem", background: "white", boxSizing: "border-box"
                          }}
                        />
                        <button
                          onClick={handleResetPasswordSubmit}
                          style={{
                            marginTop: 12, background: "#e63946", color: "white", border: "none",
                            borderRadius: 100, padding: "8px 20px", fontSize: "0.8rem", fontWeight: 700,
                            cursor: "pointer", width: "100%"
                          }}
                        >
                          Complete Password Reset
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {forgotError && (
                  <p style={{ color: "#e63946", fontSize: "0.78rem", fontWeight: 700, marginTop: 10, marginBottom: 0 }}>
                    {forgotError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#aaa", marginTop: "1.5rem" }}>
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <span onClick={() => { setIsSignup(!isSignup); setErrors({}); setName(""); setEmail(""); setPassword(""); setTermsChecked(false); setShowForgotPassword(false); }}
            style={{ color: "#e63946", fontWeight: 700, cursor: "pointer" }}>
            {isSignup ? "Log in" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
}