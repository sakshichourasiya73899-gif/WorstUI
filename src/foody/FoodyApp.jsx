import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────
// PHYSICS
// ─────────────────────────────────────────────────
function getWeightTilt(text, maxAngle = 28) {
    return Math.min(text.length * 1.8, maxAngle);
}
function getHangOffset(text, threshold = 12, maxOffset = 110) {
    const excess = text.length - threshold;
    return excess <= 0 ? 0 : Math.min(excess * 9, maxOffset);
}
function getDropOffset(text, threshold = 18, maxDrop = 60) {
    const excess = text.length - threshold;
    return excess <= 0 ? 0 : Math.min(excess * 5, maxDrop);
}

// ─────────────────────────────────────────────────
// CAPTCHA
// ─────────────────────────────────────────────────
const CHALLENGES = [
    {
        question: "Select all images that are NOT a cat (but could be)",
        instruction: "Click all that are NOT a cat (but could be a cat if they tried harder)",
        images: [
            { emoji: "🐱", label: "cat", correct: false },
            { emoji: "🦁", label: "lion", correct: true },
            { emoji: "🐶", label: "dog", correct: false },
            { emoji: "🐯", label: "tiger", correct: true },
            { emoji: "🦊", label: "fox", correct: false },
            { emoji: "🐾", label: "paws", correct: true },
        ],
    },
    {
        question: "Which of these is the LEAST like a pizza?",
        instruction: "Select the one LEAST like pizza (trick: they're all circles)",
        images: [
            { emoji: "🍕", label: "pizza", correct: false },
            { emoji: "🫓", label: "flatbread", correct: false },
            { emoji: "🎡", label: "ferris wheel", correct: true },
            { emoji: "🍩", label: "donut", correct: false },
            { emoji: "🌍", label: "globe", correct: false },
            { emoji: "🥏", label: "frisbee", correct: false },
        ],
    },
    {
        question: "Identify the traffic lights",
        instruction: "Select ONLY the traffic lights (horizontal ones don't count, we checked)",
        images: [
            { emoji: "🚦", label: "traffic light", correct: true },
            { emoji: "🔴", label: "red circle", correct: false },
            { emoji: "🟡", label: "yellow circle", correct: false },
            { emoji: "🚥", label: "horizontal light", correct: false },
            { emoji: "🔆", label: "brightness", correct: false },
            { emoji: "🪩", label: "disco ball", correct: false },
        ],
    },
    {
        question: "Select all images containing water",
        instruction: "Select all with water (tea ≠ water, clouds = clouds, good luck)",
        images: [
            { emoji: "🌊", label: "wave", correct: true },
            { emoji: "💧", label: "droplet", correct: true },
            { emoji: "🧃", label: "juice box", correct: false },
            { emoji: "🍵", label: "tea", correct: false },
            { emoji: "🫧", label: "bubbles", correct: true },
            { emoji: "🌧️", label: "rain cloud", correct: false },
        ],
    },
];

function AnnoyingCaptcha({ onVerified }) {
    const [challenge] = useState(() => CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]);
    const [selected, setSelected] = useState([]);
    const [attempts, setAttempts] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [shuffled, setShuffled] = useState([]);
    const [spinIndex, setSpinIndex] = useState(null);

    useEffect(() => {
        setShuffled([...challenge.images].sort(() => Math.random() - 0.5));
    }, [challenge]);

    const toggle = (i) => {
        setSpinIndex(i);
        setTimeout(() => setSpinIndex(null), 500);
        setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
    };

    const verify = () => {
        const correctIndexes = shuffled.map((img, i) => img.correct ? i : null).filter(i => i !== null);
        const isCorrect = selected.length === correctIndexes.length && correctIndexes.every(i => selected.includes(i));
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (isCorrect) {
            setFeedback({ type: "success", msg: "Fine. You passed. We're still suspicious." });
            setTimeout(() => onVerified(), 1200);
        } else {
            const msgs = [
                "Wrong. Also we reshuffled. Try again.",
                "Nope. Are you even human?",
                "Incorrect. Images rotated 90° as punishment.",
                "Still wrong. We've alerted the authorities.",
                `You've failed ${newAttempts} times. Impressive.`,
                "Are you a confused robot?",
            ];
            setFeedback({ type: "error", msg: msgs[Math.min(newAttempts - 1, msgs.length - 1)] });
            setShuffled(prev => [...prev].sort(() => Math.random() - 0.5));
            setSelected([]);
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif" }}>
            <div style={{ background: "white", borderRadius: 24, padding: "2rem", maxWidth: 420, width: "92%", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: "1.5rem" }}>🤖</span>
                    <div>
                        <p style={{ fontWeight: 800, fontSize: "0.95rem", margin: 0 }}>Security Verification™</p>
                        <p style={{ color: "#aaa", fontSize: "0.72rem", margin: 0 }}>Proving you're human (probably)</p>
                    </div>
                    <div style={{ marginLeft: "auto", background: "#fff3f3", borderRadius: 8, padding: "3px 8px", fontSize: "0.7rem", color: "#e63946", fontWeight: 700 }}>ATTEMPT #{attempts + 1}</div>
                </div>
                <div style={{ height: 1, background: "#f0ece8", margin: "12px 0" }} />
                <p style={{ fontSize: "0.8rem", color: "#e63946", fontWeight: 700, margin: "0 0 4px" }}>{challenge.question}</p>
                <p style={{ fontSize: "0.72rem", color: "#aaa", fontStyle: "italic", margin: "0 0 14px" }}>{challenge.instruction}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                    {shuffled.map((img, i) => {
                        const isSel = selected.includes(i);
                        return (
                            <div key={i} onClick={() => toggle(i)} style={{
                                border: `3px solid ${isSel ? "#e63946" : "#e8e4e0"}`, borderRadius: 14, padding: "18px 10px", textAlign: "center",
                                cursor: "pointer", background: isSel ? "#fff0f1" : "#faf8f6",
                                transform: spinIndex === i ? "rotate(360deg) scale(1.1)" : attempts % 2 === 1 ? `rotate(${(i * 37) % 8 - 4}deg)` : "none",
                                transition: "transform 0.3s", userSelect: "none", position: "relative",
                            }}>
                                <span style={{ fontSize: "2.2rem", display: "block", lineHeight: 1.1 }}>{img.emoji}</span>
                                <span style={{ fontSize: "0.62rem", color: isSel ? "#e63946" : "#ccc", display: "block", marginTop: 6, fontWeight: 600 }}>
                                    {isSel ? "✓ selected" : img.label}
                                </span>
                                {isSel && <div style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, background: "#e63946", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "white" }}>✓</div>}
                            </div>
                        );
                    })}
                </div>
                {feedback && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 12, background: feedback.type === "success" ? "#f0fff4" : "#fff0f1", border: `1px solid ${feedback.type === "success" ? "#b2f5c8" : "#ffd6d6"}`, fontSize: "0.78rem", color: feedback.type === "success" ? "#2ecc71" : "#e63946", fontWeight: 600 }}>
                        {feedback.type === "success" ? "✅" : "❌"} {feedback.msg}
                    </div>
                )}
                <button onClick={verify} style={{
                    width: "100%", background: "#e63946", color: "white", border: "none", borderRadius: 100,
                    padding: "0.85rem", fontSize: "0.9rem", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                    transform: attempts > 2 ? `translateX(${Math.sin(attempts) * 15}px)` : "none", transition: "transform 0.3s"
                }}>
                    {attempts === 0 ? "Verify I'm Human" : attempts < 3 ? "Try Again (You Can Do This)" : "Please Just Pass Me"}
                </button>
                <p style={{ textAlign: "center", fontSize: "0.65rem", color: "#ddd", marginTop: 10, fontStyle: "italic" }}>Protected by reCAPTCHA Knock-Off™ · 🍕</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────
// FLOATING BUTTON
// ─────────────────────────────────────────────────
function FloatingButton({ label, onClick, containerRef }) {
    const btnRef = useRef(null);
    const posRef = useRef({ x: null, y: null });
    const corneredRef = useRef(false);
    const [pos, setPos] = useState({ x: null, y: null });
    const [cornered, setCornered] = useState(false);
    const [message, setMessage] = useState(null);
    const [hasStartedRunning, setHasStartedRunning] = useState(false);
    const BTN_W = 180, BTN_H = 48, WALL_PADDING = 20;

    const CORNER_MSGS = [
        "Fine. You caught me.",
        "Ugh. Okay.",
        "I can't run anymore.",
        "...please be gentle.",
        "You win. This time.",
    ];

    const getBounds = useCallback(() => {
        const el = containerRef?.current;
        if (!el) return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
    }, [containerRef]);

    const handleMouseEnter = () => {
        if (!hasStartedRunning && !cornered) {
            const rect = btnRef.current.getBoundingClientRect();
            posRef.current = { x: rect.left, y: rect.top };
            setPos({ x: rect.left, y: rect.top });
            setHasStartedRunning(true);
        }
    };

    useEffect(() => {
        if (cornered || !hasStartedRunning) return;
        
        const handleMouseMove = (e) => {
            if (posRef.current.x === null) return;
            
            const cx = posRef.current.x + BTN_W / 2;
            const cy = posRef.current.y + BTN_H / 2;
            
            const dx = cx - e.clientX;
            const dy = cy - e.clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 180) {
                const angle = Math.atan2(dy, dx);
                
                let force = (180 - dist) * 0.48;
                if (dist < 50) {
                    force *= 1.8;
                }

                let nextX = posRef.current.x + Math.cos(angle) * force;
                let nextY = posRef.current.y + Math.sin(angle) * force;

                const bounds = getBounds();
                const minX = bounds.left + WALL_PADDING;
                const maxX = bounds.left + bounds.width - BTN_W - WALL_PADDING;
                const minY = bounds.top + WALL_PADDING;
                const maxY = bounds.top + bounds.height - BTN_H - WALL_PADDING;

                if (nextX <= minX) nextX = minX;
                if (nextX >= maxX) nextX = maxX;
                if (nextY <= minY) nextY = minY;
                if (nextY >= maxY) nextY = maxY;

                const inCornerX = (nextX <= minX + 5 || nextX >= maxX - 5);
                const inCornerY = (nextY <= minY + 5 || nextY >= maxY - 5);
                
                if (inCornerX && inCornerY) {
                    corneredRef.current = true;
                    setCornered(true);
                    setMessage(CORNER_MSGS[Math.floor(Math.random() * CORNER_MSGS.length)]);
                }

                posRef.current = { x: nextX, y: nextY };
                setPos({ x: nextX, y: nextY });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [cornered, hasStartedRunning, getBounds]);

    const handleClick = (e) => {
        if (!cornered) {
            e.preventDefault();
            const bounds = getBounds();
            
            const rx = bounds.left + WALL_PADDING + Math.random() * (bounds.width - BTN_W - 2 * WALL_PADDING);
            const ry = bounds.top + WALL_PADDING + Math.random() * (bounds.height - BTN_H - 2 * WALL_PADDING);
            
            posRef.current = { x: rx, y: ry };
            setPos({ x: rx, y: ry });
            setMessage("Too slow! 😜");
            
            setTimeout(() => {
                setMessage(null);
            }, 1500);
            return;
        }
        onClick();
    };

    if (hasStartedRunning && pos.x === null) return null;

    return (
        <div
            ref={btnRef}
            onMouseEnter={handleMouseEnter}
            style={{
                position: hasStartedRunning ? "fixed" : "relative",
                left: hasStartedRunning ? pos.x : undefined,
                top: hasStartedRunning ? pos.y : undefined,
                zIndex: 8888,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                pointerEvents: "auto",
            }}
        >
            {message && (
                <div style={{
                    background: "#fff", border: "2px solid #e63946", borderRadius: 12,
                    padding: "5px 12px", fontSize: "0.72rem", color: "#e63946",
                    fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'Nunito', sans-serif",
                    boxShadow: "0 4px 16px rgba(230,57,70,0.15)",
                    animation: "fadeInMsg 0.3s ease"
                }}>
                    {message}
                </div>
            )}
            <button
                onClick={handleClick}
                style={{
                    width: BTN_W,
                    height: BTN_H,
                    background: cornered ? "#e63946" : "#18181b",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: 4,
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: cornered ? "pointer" : "default",
                    fontFamily: "'Nunito', sans-serif",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                    transition: "background 0.2s, box-shadow 0.2s",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    {label}
                </span>
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────
// WEIGHTED INPUT
// ─────────────────────────────────────────────────
function WeightedInput({ value, onChange, placeholder, type = "text" }) {
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
        }}>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: "100%", background: "#f5f1f1", border: "2px solid transparent",
                    borderRadius: 100, padding: "14px 42px 14px 16px",
                    fontSize: "0.9rem", outline: "none", fontFamily: "inherit",
                    boxSizing: "border-box", transition: "border-color 0.2s",
                }}
            />
            {value.length > 0 && (
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: "0.62rem", color: "#e63946", fontWeight: 800, fontFamily: "monospace", opacity: 0.65 }}>
                    {value.length}kg
                </span>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────
// TERMS
// ─────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────
// PASSWORD RULES
// ─────────────────────────────────────────────────
function hasEmoji(str) {
    return /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu.test(str);
}

const PW_RULES = [
    { label: "At least 10 characters.", test: (p) => p.length >= 10 },
    { label: "At least 1 Capital letter.", test: (p) => /[A-Z]/.test(p) },
    { label: "At least 1 Numeral.", test: (p) => /[0-9]/.test(p) },
    { label: "At least 1 letter from your email.", test: (p, e) => e.length > 0 && p.split("").some(c => /[a-zA-Z]/.test(c) && e.includes(c)) },
    { label: "At least 1 Cyrillic character.", test: (p) => /[\u0400-\u04FF]/.test(p) },
    { label: "At least 1 emoji 🙂", test: (p) => hasEmoji(p) },
    { label: "Must NOT contain 'password'.", test: (p) => !/password/i.test(p) },
];

// ─────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────
const POPUP_INTERVAL = 40;

export default function FoodyApp() {
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
    const lastClose = useRef(0);
    const containerRef = useRef(null);

    useEffect(() => {
        const t = setInterval(() => {
            setSecs(s => {
                const next = s + 1;
                if (!popupOpen && next - lastClose.current >= POPUP_INTERVAL) setPopupOpen(true);
                return next;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [popupOpen]);

    useEffect(() => {
        if (captchaPassed && pendingSubmit) { setPendingSubmit(false); doSignup(); }
    }, [captchaPassed]);

    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    const pwPassed = PW_RULES.map(r => r.test(password, email));
    const allPw = pwPassed.every(Boolean);

    const validate = () => {
        const e = {};
        if (isSignup && !name.trim()) e.name = "That's literally not your name.";
        if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "That's not an email. That's abstract art.";
        if (!allPw) e.password = "Password fails our totally reasonable requirements.";
        if (isSignup && termsChecked) e.terms = "You must accept (by not checking) the Terms.";
        return e;
    };

    const doSignup = () => { setUser({ name: name || "mystery person", email }); setLoggedIn(true); };

    const handleClick = () => {
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length) return;
        if (!captchaPassed) { setPendingSubmit(true); setShowCaptcha(true); return; }
        doSignup();
    };

    const logout = () => {
        setUser(null); setLoggedIn(false);
        setName(""); setEmail(""); setPassword("");
        setErrors({}); setTermsChecked(false);
        setCaptchaPassed(false); setPendingSubmit(false);
    };

    // ── LOGGED IN ──
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
                    <p style={{ color: "#aaa", fontSize: "0.75rem", margin: 0, fontStyle: "italic", display: "flex", alignItems: "center", gap: 4 }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", verticalAlign: "middle" }}>
                        <path d="M6 18C8.5 15.5 14.5 12.5 17 9.5C14.5 12 8.5 15 6 18Z" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" fill="#b48352"/>
                        <path d="M8.5 15.5C10.5 14 13.5 12.5 15 11.5" stroke="#6f421b" strokeWidth="1" strokeLinecap="round"/>
                        <path d="M8 12C10.5 10 15.5 8 18 6C15.5 8 10.5 10.5 8 12Z" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" fill="#d2b48c"/>
                        <path d="M10.5 10C12.5 9 14.5 8 16 7.5" stroke="#6f421b" strokeWidth="1" strokeLinecap="round"/>
                      </svg>
                      Codename: Cumin
                    </p>
                    <p style={{ color: "#aaa", fontSize: "0.75rem", margin: "4px 0 0", fontStyle: "italic" }}>⏱ Time wasted: {fmt(secs)}</p>
                </div>
                <button onClick={logout} style={{ background: "#e63946", color: "white", border: "none", borderRadius: 100, padding: "0.85rem 2rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
                    Log out (bye Cumin)
                </button>
            </div>
        </div>
    );

    // ── TERMS ──
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

    // ── MAIN ──
    return (
        <div ref={containerRef} style={{ minHeight: "100vh", background: "#f5f1f1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif", position: "relative", overflow: "hidden" }}>
            <style>{`
        @keyframes popIn { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes fadeInMsg { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        input:focus { border-color: #e63946 !important; }
      `}</style>

            {showCaptcha && <AnnoyingCaptcha onVerified={() => { setCaptchaPassed(true); setShowCaptcha(false); }} />}

            {/* ── Timed popup ── */}
            {popupOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "white", borderRadius: 20, padding: "2.5rem 3rem", textAlign: "center", maxWidth: 320, width: "90%", animation: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                        <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "1.35rem", margin: "0 0 6px" }}>Hurry up, time is ticking!</p>
                        <p style={{ color: "#aaa", fontSize: "0.8rem", marginBottom: 16, fontStyle: "italic" }}>Your food is getting cold.<br />(We made that up.)</p>
                        <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "#e63946", fontFamily: "monospace", marginBottom: 22 }}>{fmt(secs)}</div>
                        <button onClick={() => { setPopupOpen(false); lastClose.current = secs; }}
                            style={{ background: "#2ecc71", color: "white", border: "none", borderRadius: 100, padding: "0.75rem 2.5rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", display: "block", margin: "0 auto 14px", fontFamily: "inherit" }}>
                            Lock
                        </button>
                        <span onClick={() => { setPopupOpen(false); lastClose.current = secs; }} style={{ fontSize: "0.68rem", color: "#ddd", cursor: "pointer", userSelect: "none" }}>©lose 2026</span>
                    </div>
                </div>
            )}

            {/* ── Card ── */}
            <div style={{ width: "100%", maxWidth: 440, background: "white", borderRadius: 32, padding: "2.5rem 2.5rem 4rem", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
                <div style={{ textAlign: "center", marginBottom: "0.6rem" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 800, color: "#e63946" }}>⏱ {fmt(secs)}</span>
                    <span style={{ fontSize: "0.7rem", color: "#ccc", marginLeft: 6, fontStyle: "italic" }}>wasted</span>
                </div>
                <p style={{ textAlign: "center", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "2rem", margin: "0 0 4px" }}>F<span style={{ color: "#e63946" }}>oo</span>dy</p>
                <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#aaa", marginBottom: "2rem" }}>
                    {isSignup ? "Create your account" : "Welcome back, brave soul"}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Name */}
                    {isSignup && (
                        <div style={{ overflow: "visible", paddingBottom: Math.max(getDropOffset(name), 0) + 8 }}>
                            <WeightedInput value={name} onChange={setName} placeholder="Full name" />
                            {errors.name && <p style={{ color: "#e63946", fontSize: "0.75rem", marginTop: 4, marginLeft: 14 }}>{errors.name}</p>}
                        </div>
                    )}

                    {/* Email */}
                    <div style={{ overflow: "visible", paddingBottom: Math.max(getDropOffset(email), 0) + 8 }}>
                        <WeightedInput value={email} onChange={setEmail} placeholder="Email" type="email" />
                        {errors.email && <p style={{ color: "#e63946", fontSize: "0.75rem", marginTop: 4, marginLeft: 14 }}>{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <div style={{ position: "relative" }}>
                            <div style={{ position: "absolute", inset: 0, background: "#f5f1f1", borderRadius: 100, zIndex: 0 }} />
                            <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                                padding: "0 16px", display: "flex", alignItems: "center",
                                pointerEvents: "none", zIndex: 1, overflow: "hidden"
                            }}>
                                {password
                                    ? <span style={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                                style={{
                                    width: "100%", border: "2px solid transparent", borderRadius: 100,
                                    padding: "14px 16px", fontSize: "0.9rem", outline: "none", fontFamily: "inherit",
                                    boxSizing: "border-box", color: "transparent", caretColor: "#333",
                                    position: "relative", zIndex: 2, background: "transparent"
                                }}
                            />
                        </div>

                        {password.length > 0 && (
                            <div style={{ marginTop: 8, padding: "10px 14px", background: "#fff8f8", borderRadius: 12, border: "1px solid #fde" }}>
                                {PW_RULES.map((r, i) => (
                                    <p key={i} style={{ fontSize: "0.76rem", color: pwPassed[i] ? "#2ecc71" : "#e63946", margin: "3px 0", fontStyle: "italic" }}>
                                        {pwPassed[i] ? "✓" : "✗"} {r.label}
                                    </p>
                                ))}
                            </div>
                        )}
                        {allPw && password.length > 0 && <p style={{ color: "#e63946", fontSize: "0.75rem", marginTop: 5, marginLeft: 14, fontStyle: "italic" }}>⚠️ Your password is not unsafe. This worries us.</p>}
                        {errors.password && <p style={{ color: "#e63946", fontSize: "0.75rem", marginTop: 4, marginLeft: 14 }}>{errors.password}</p>}
                    </div>

                    {/* Backwards T&C */}
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
                            {errors.terms && <p style={{ color: "#e63946", fontSize: "0.75rem", marginTop: 4, marginLeft: 26, animation: "shake 0.4s" }}>Please do NOT forget to accept our terms and conditions.</p>}
                        </div>
                    )}

                    {captchaPassed && <p style={{ fontSize: "0.75rem", color: "#2ecc71", margin: 0, fontWeight: 700 }}>✅ You are probably human. Probably.</p>}
                </div>

                <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#aaa", marginTop: "1.5rem" }}>
                    {isSignup ? "Already have an account?" : "New here?"}{" "}
                    <span onClick={() => { setIsSignup(!isSignup); setErrors({}); setName(""); setEmail(""); setPassword(""); setTermsChecked(false); }}
                        style={{ color: "#e63946", fontWeight: 700, cursor: "pointer" }}>
                        {isSignup ? "Log in" : "Sign up"}
                    </span>
                </p>
            </div>

            {/* ── FLOATING BUTTON ── */}
            <FloatingButton
                label={isSignup ? "Sign Up" : "Log In"}
                onClick={handleClick}
                containerRef={containerRef}
            />
        </div>
    );
}