import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight, ChevronLeft, CheckCircle2, AlertCircle,
    Loader2, X, Utensils, Phone, Mail, User, Delete, ZoomIn,
} from "lucide-react";

/* ══════════════════════════════════════════════════
   GLOBAL RAGE CURSOR — grows on every click
══════════════════════════════════════════════════ */
const RageCursor = () => {
    const [size, setSize] = useState(16);
    const [pos, setPos] = useState({ x: -200, y: -200 });
    const [burst, setBurst] = useState(false);

    useEffect(() => {
        const move = (e) => setPos({ x: e.clientX, y: e.clientY });
        const click = () => {
            setSize(s => Math.min(s + 14, 180));
            setBurst(true);
            setTimeout(() => setBurst(false), 200);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("click", click);
        return () => { window.removeEventListener("mousemove", move); window.removeEventListener("click", click); };
    }, []);

    return (
        <div style={{
            position: "fixed",
            left: pos.x - size / 2,
            top: pos.y - size / 2,
            width: size,
            height: size,
            borderRadius: "50%",
            border: `${Math.max(2, size / 10)}px solid #e63946`,
            background: burst ? "rgba(230,57,70,0.12)" : "transparent",
            pointerEvents: "none",
            zIndex: 999999,
            transition: "width 0.35s, height 0.35s, left 0.04s, top 0.04s",
        }} />
    );
};

/* ══════════════════════════════════════════════════
   TSUNAMI WAVE
══════════════════════════════════════════════════ */
const TsunamiWave = ({ onComplete }) => (
    <motion.div
        initial={{ x: "-110%" }}
        animate={{ x: "110%" }}
        transition={{ duration: 1.9, ease: [0.4, 0, 0.2, 1] }}
        onAnimationComplete={onComplete}
        style={{
            position: "fixed", inset: 0, zIndex: 999998,
            background: "linear-gradient(180deg,rgba(20,70,150,0.93) 0%,rgba(8,35,90,0.97) 65%,rgba(4,18,55,1) 100%)",
            pointerEvents: "none",
        }}
    >
        <svg style={{ position: "absolute", right: -1, top: 0, height: "100%", width: 90 }} viewBox="0 0 90 800" preserveAspectRatio="none">
            <path d="M90,0 Q0,200 90,400 Q180,600 90,800 L90,800 L90,0Z" fill="rgba(20,70,150,0.93)" />
        </svg>
        <p style={{
            color: "rgba(255,255,255,0.85)", fontFamily: "Georgia,serif",
            fontSize: "1rem", letterSpacing: "0.04em",
            position: "absolute", bottom: "28%", left: "30%",
            fontStyle: "italic", userSelect: "none",
        }}>
            Rearranging everything. You're welcome.
        </p>
    </motion.div>
);

/* ══════════════════════════════════════════════════
   STEP 1 — DATE: every cell wiggles violently
══════════════════════════════════════════════════ */
const WiggleCell = ({ day, isPast, isBlocked, isSelected, onClick }) => {
    const phase = useRef(Math.random() * Math.PI * 2);
    const freq = useRef(10 + Math.random() * 8);
    const amp = useRef(isBlocked ? 6 : isPast ? 2 : 5);
    const [rot, setRot] = useState(0);
    const [tx, setTx] = useState(0);

    useEffect(() => {
        let frame;
        const tick = (t) => {
            setRot(Math.sin(t / (1000 / freq.current) + phase.current) * amp.current);
            setTx(Math.cos(t / (850 / freq.current) + phase.current) * (amp.current * 0.45));
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <button
            onClick={onClick}
            style={{
                padding: "8px 0", borderRadius: 8,
                border: isSelected ? "2px solid #e63946" : "1px solid transparent",
                background: isSelected ? "#e63946" : isPast || isBlocked ? "#f0ecea" : "white",
                color: isSelected ? "white" : isPast || isBlocked ? "#ccc" : "#1a1a1a",
                fontSize: "0.82rem", cursor: isPast ? "not-allowed" : isBlocked ? "wait" : "pointer",
                fontWeight: isSelected ? 600 : 400,
                transform: `rotate(${rot}deg) translateX(${tx}px)`,
                display: "inline-block",
            }}
        >
            {day}
        </button>
    );
};

const StepDate = ({ value, onChange }) => {
    const [blockedDates, setBlockedDates] = useState([]);
    const [tooltip, setTooltip] = useState(null);
    const [infiniteLoad, setInfiniteLoad] = useState(false);
    const [loadMsgIdx, setLoadMsgIdx] = useState(0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [viewYear, setViewYear] = useState(today.getFullYear());

    const loadMsgs = [
        "Checking availability…", "Still checking…", "Contacting calendar servers…",
        "Almost there…", "Re-verifying from scratch…", "Our server sneezed. Retrying…",
        "Loading complete. Reloading for safety…",
    ];

    useEffect(() => {
        const pick = () => {
            const b = new Set();
            while (b.size < 8) {
                const d = new Date(today);
                d.setDate(today.getDate() + Math.floor(Math.random() * 28) + 1);
                b.add(d.toISOString().split("T")[0]);
            }
            setBlockedDates([...b]);
        };
        pick();
        const iv = setInterval(pick, 6000);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        if (!infiniteLoad) return;
        const iv = setInterval(() => setLoadMsgIdx(m => (m + 1) % loadMsgs.length), 2200);
        return () => clearInterval(iv);
    }, [infiniteLoad]);

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();

    const handleDayClick = (day) => {
        const d = new Date(viewYear, viewMonth, day);
        const iso = d.toISOString().split("T")[0];
        if (d < today) { setTooltip("That's in the past. Even we can't undo time."); setTimeout(() => setTooltip(null), 2500); return; }
        if (blockedDates.includes(iso)) {
            setInfiniteLoad(true);
            setTimeout(() => {
                setInfiniteLoad(false);
                setTooltip("Still fully booked. We checked 7 times.");
                setTimeout(() => setTooltip(null), 3000);
            }, 7000);
            return;
        }
        onChange(iso);
    };

    if (infiniteLoad) return (
        <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block", marginBottom: "1.5rem" }}>
                <Loader2 size={36} style={{ color: "#e63946" }} />
            </motion.div>
            <AnimatePresence mode="wait">
                <motion.p key={loadMsgIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontFamily: "Georgia,serif", fontSize: "1rem", color: "#555" }}>
                    {loadMsgs[loadMsgIdx]}
                </motion.p>
            </AnimatePresence>
            <div style={{ height: 3, background: "#f0ecea", borderRadius: 2, overflow: "hidden", maxWidth: 220, margin: "1.5rem auto 0" }}>
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: "55%", height: "100%", background: "#e63946", borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: "0.7rem", color: "#bbb", marginTop: "0.75rem", fontStyle: "italic" }}>
                This is not a progress bar. It's moral support.
            </p>
        </div>
    );

    return (
        <div>
            <p style={{ color: "#888", fontSize: "0.78rem", marginBottom: "0.75rem", fontStyle: "italic" }}>
                Availability updates every few seconds. The calendar is anxious.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }} style={navBtnStyle}><ChevronLeft size={16} /></button>
                <span style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "1rem" }}>{months[viewMonth]} {viewYear}</span>
                <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }} style={navBtnStyle}><ChevronRight size={16} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "6px" }}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <div key={d} style={{ textAlign: "center", fontSize: "0.7rem", color: "#999", fontWeight: 500, padding: "4px 0" }}>{d}</div>
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {Array(firstDay).fill(null).map((_, i) => <div key={"e" + i} />)}
                {Array(daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1;
                    const d = new Date(viewYear, viewMonth, day);
                    const iso = d.toISOString().split("T")[0];
                    return (
                        <WiggleCell key={iso} day={day} isPast={d < today} isBlocked={blockedDates.includes(iso)} isSelected={value === iso} onClick={() => handleDayClick(day)} />
                    );
                })}
            </div>
            <AnimatePresence>
                {tooltip && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ marginTop: "0.75rem", background: "#fff3f3", border: "1px solid #f5c5c5", borderRadius: 10, padding: "0.6rem 1rem", fontSize: "0.82rem", color: "#b0272c" }}>
                        <AlertCircle size={13} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
                        {tooltip}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   STEP 2 — TIME: slots shrink + drift + vanish
══════════════════════════════════════════════════ */
const ALL_TIMES = ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"];

const StepTime = ({ value, onChange }) => {
    const [slots, setSlots] = useState(() => ALL_TIMES.map(t => ({ time: t, scale: 1, x: 0, y: 0, gone: false })));
    const [popupMsg, setPopupMsg] = useState(null);

    useEffect(() => {
        const shrinkIv = setInterval(() => {
            setSlots(prev => {
                const available = prev.filter(s => !s.gone && s.time !== value);
                if (!available.length) return prev;
                const victim = available[Math.floor(Math.random() * available.length)];
                return prev.map(s => s.time === victim.time
                    ? { ...s, scale: Math.max(0.52, s.scale - 0.14), x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 8 }
                    : s
                );
            });
        }, 2800);
        const vanishIv = setInterval(() => {
            setSlots(prev => {
                const tiny = prev.filter(s => !s.gone && s.scale < 0.68 && s.time !== value);
                if (!tiny.length) return prev;
                const victim = tiny[Math.floor(Math.random() * tiny.length)];
                setPopupMsg(`${victim.time} just left. It looked tired.`);
                setTimeout(() => setPopupMsg(null), 2800);
                return prev.map(s => s.time === victim.time ? { ...s, gone: true } : s);
            });
        }, 7000);
        return () => { clearInterval(shrinkIv); clearInterval(vanishIv); };
    }, [value]);

    return (
        <div>
            <p style={{ color: "#888", fontSize: "0.78rem", marginBottom: "1rem", fontStyle: "italic" }}>
                Slots are actively disappearing. This is intentional.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {slots.map(s => {
                    const isSelected = value === s.time;
                    if (s.gone && !isSelected) return (
                        <div key={s.time} style={{ padding: "0.75rem", borderRadius: 12, background: "#fafafa", border: "1px dashed #eee", fontSize: "0.72rem", color: "#ddd", textDecoration: "line-through", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {s.time}
                        </div>
                    );
                    return (
                        <motion.button key={s.time} onClick={() => !s.gone && onChange(s.time)}
                            animate={{ scale: isSelected ? 1 : s.scale, x: s.x, y: s.y }}
                            transition={{ type: "spring", stiffness: 200, damping: 18 }}
                            style={{
                                padding: "0.75rem 0.5rem", borderRadius: 12,
                                border: isSelected ? "2px solid #e63946" : `1px solid ${s.scale < 0.75 ? "#f5c5c5" : "#e8e2e2"}`,
                                background: isSelected ? "#e63946" : "white",
                                color: isSelected ? "white" : s.scale < 0.75 ? "#b0272c" : "#1a1a1a",
                                fontSize: `${Math.max(0.62, 0.88 * s.scale)}rem`,
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                                fontWeight: isSelected ? 600 : 400, fontFamily: "inherit",
                            }}>
                            <span style={{ fontSize: "0.7em", opacity: 0.35 }}>◷</span>
                            <span>{s.time}</span>
                            {isSelected ? <CheckCircle2 size={12} /> : s.scale < 0.78 ? <span style={{ fontSize: "0.58rem", color: "#e63946" }}>Fading</span> : <span />}
                        </motion.button>
                    );
                })}
            </div>
            <AnimatePresence>
                {popupMsg && (
                    <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "#b0272c", fontStyle: "italic" }}>
                        {popupMsg}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   STEP 3 — GUESTS: slider with obstacles
══════════════════════════════════════════════════ */
const StepGuests = ({ value, onChange }) => {
    const [warning, setWarning] = useState(null);
    const [obstacle, setObstacle] = useState(null);
    const [locked, setLocked] = useState(false);
    const notes = {
        1: "One person. The table will be judged.", 2: "Two. We'll seat you near the kitchen.",
        3: "Three is an odd number. Literally.", 4: "Four. Our computers can handle four.",
        5: "Five? We need to find five chairs first.", 6: "Six. This is getting complicated.",
        7: "Seven. Are you sure? Count again.", 8: "Eight. We will call you. Or not.",
    };

    useEffect(() => {
        const obstacles = ["Wet floor", "Staff crossing", "Menu trolley", "Chef passing", "Table being set", "Sommelier incident"];
        const iv = setInterval(() => {
            const lbl = obstacles[Math.floor(Math.random() * obstacles.length)];
            setObstacle({ label: lbl, x: 15 + Math.random() * 70 });
            setLocked(true);
            setWarning(`Slider blocked: ${lbl}. Please wait.`);
            setTimeout(() => { setObstacle(null); setLocked(false); setWarning(null); }, 3500);
        }, 5500);
        return () => clearInterval(iv);
    }, []);

    const handleChange = (e) => {
        if (locked) { setWarning("The slider is currently indisposed."); return; }
        let v = parseInt(e.target.value);
        if (Math.random() < 0.35 && v > 1) {
            v = v - 1;
            setWarning("The slider had a moment of self-doubt.");
            setTimeout(() => setWarning(null), 2500);
        }
        onChange(v);
    };

    return (
        <div>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <motion.div key={value} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{ fontSize: "3.5rem", fontFamily: "Georgia, serif", fontWeight: 700, color: "#e63946", lineHeight: 1 }}>
                    {value}
                </motion.div>
                <p style={{ fontSize: "0.8rem", color: "#888", marginTop: 4 }}>guests</p>
            </div>
            <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                <input type="range" min={1} max={8} value={value} onChange={handleChange}
                    style={{ width: "100%", accentColor: "#e63946", cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.45 : 1 }} />
                <AnimatePresence>
                    {obstacle && (
                        <motion.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0 }}
                            style={{
                                position: "absolute", top: "50%", left: `${obstacle.x}%`,
                                transform: "translate(-50%, -50%)",
                                background: "#1a1a1a", color: "white",
                                fontSize: "0.62rem", padding: "3px 8px", borderRadius: 100,
                                whiteSpace: "nowrap", pointerEvents: "none",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }}>
                            {obstacle.label}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#aaa", marginBottom: "1.25rem" }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <span key={n} style={{ color: n === value ? "#e63946" : "#ccc", fontWeight: n === value ? 700 : 400 }}>{n}</span>)}
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={value} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    style={{ background: "white", border: "1px solid #ede8e8", borderRadius: 12, padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#555", fontStyle: "italic" }}>
                    {notes[value]}
                </motion.div>
            </AnimatePresence>
            {warning && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "#b0272c" }}>
                    <AlertCircle size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                    {warning}
                </motion.p>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   STEP 4 — DETAILS: appending placeholders + dialpad
══════════════════════════════════════════════════ */
const NAME_PH = "Your full legal name as it appears on government-issued ID";
const EMAIL_PH = "youremail@example.com (we will not spam. much.)";
const NOTES_PH = "Special requests, dietary restrictions, unreasonable expectations, life stories…";

const AppendInput = ({ placeholder, value, onChange, asTextarea = false }) => (
    <div style={{ position: "relative" }}>
        {asTextarea ? (
            <textarea value={value} onChange={e => onChange(e.target.value)} rows={4}
                style={{ ...appendBase, resize: "none", minHeight: 88, fontFamily: "inherit" }} placeholder="" />
        ) : (
            <input value={value} onChange={e => onChange(e.target.value)}
                style={appendBase} placeholder="" />
        )}
        <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            padding: "0.65rem 0.9rem", fontSize: "0.88rem", pointerEvents: "none",
            display: "flex", alignItems: asTextarea ? "flex-start" : "center",
            overflow: "hidden", whiteSpace: asTextarea ? "pre-wrap" : "nowrap",
            wordBreak: "break-word",
        }}>
            <span style={{ color: "transparent", whiteSpace: "pre" }}>{value}</span>
            <span style={{ color: "#c0b8b8", fontStyle: "italic" }}>{placeholder.slice(value.length)}</span>
        </div>
    </div>
);

const Dialpad = ({ value, onChange }) => {
    const keys = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["*", "0", "#"]];
    const press = (k) => {
        if (k === "*") return;
        if (k === "#") { onChange(value.slice(0, -1)); return; }
        if (value.length < 13) onChange(value + k);
    };
    return (
        <div>
            <div style={{ background: "white", border: "1px solid #e8e2e2", borderRadius: 12, padding: "0.7rem 1rem", fontFamily: "Georgia,serif", letterSpacing: "0.2em", fontSize: "1.1rem", color: "#1a1a1a", marginBottom: "0.5rem", minHeight: 44, display: "flex", alignItems: "center" }}>
                {value || <span style={{ color: "#ccc", fontSize: "0.8rem", fontFamily: "inherit", fontStyle: "italic", letterSpacing: 0 }}>Use the pad below</span>}
            </div>
            <p style={{ fontSize: "0.68rem", color: "#aaa", marginBottom: "0.75rem", fontStyle: "italic" }}>
                Keyboard disabled for security. (This was decided at 2am.)
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, maxWidth: 230, margin: "0 auto" }}>
                {keys.flat().map((k, i) => (
                    <motion.button key={i} whileTap={{ scale: 0.88 }} onClick={() => press(k)}
                        style={{
                            padding: "0.9rem 0", borderRadius: 12, border: "1px solid #e8e2e2",
                            background: k === "*" ? "#fafafa" : k === "#" ? "#fff3f3" : "white",
                            color: k === "*" ? "#ccc" : k === "#" ? "#e63946" : "#1a1a1a",
                            fontSize: "1rem", fontWeight: 500, cursor: k === "*" ? "not-allowed" : "pointer",
                            fontFamily: "Georgia,serif", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                        {k === "#" ? <Delete size={15} /> : k}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

const StepDetails = ({ value, onChange }) => {
    const [emailState, setEmailState] = useState("idle");
    const [activeField, setActiveField] = useState("name");
    const timerRef = useRef(null);

    const handleEmail = (v) => {
        onChange({ ...value, email: v });
        clearTimeout(timerRef.current);
        if (v.includes("@") && v.includes(".")) {
            setEmailState("checking");
            timerRef.current = setTimeout(() => {
                setEmailState("wrong");
                setTimeout(() => setEmailState("ok"), 3500);
            }, 2200);
        } else setEmailState("idle");
    };

    const fields = [
        { id: "name", label: "Full Name" }, { id: "email", label: "Email" },
        { id: "phone", label: "Phone" }, { id: "notes", label: "Requests" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p style={{ color: "#888", fontSize: "0.78rem", fontStyle: "italic", margin: "0 0 0.25rem" }}>
                This is the easy part. Or so we let you believe.
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {fields.map(f => (
                    <button key={f.id} onClick={() => setActiveField(f.id)}
                        style={{ padding: "0.35rem 0.85rem", borderRadius: 100, border: "none", background: activeField === f.id ? "#1a1a1a" : "#ede8e8", color: activeField === f.id ? "white" : "#888", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all 0.15s" }}>
                        {f.label}
                    </button>
                ))}
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={activeField} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                    {activeField === "name" && (
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <AppendInput placeholder={NAME_PH} value={value.name} onChange={v => onChange({ ...value, name: v })} />
                            {value.name.length > 0 && value.name.length < 4 && (
                                <p style={{ fontSize: "0.72rem", color: "#aaa", marginTop: 4, fontStyle: "italic" }}>That seems short for a full legal name.</p>
                            )}
                        </div>
                    )}
                    {activeField === "email" && (
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ position: "relative" }}>
                                <AppendInput placeholder={EMAIL_PH} value={value.email} onChange={handleEmail} />
                                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
                                    {emailState === "checking" && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Loader2 size={14} style={{ color: "#aaa" }} /></motion.div>}
                                    {emailState === "wrong" && <AlertCircle size={14} style={{ color: "#e63946" }} />}
                                    {emailState === "ok" && <CheckCircle2 size={14} style={{ color: "#2d9e6a" }} />}
                                </div>
                            </div>
                            {emailState === "wrong" && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: "0.72rem", color: "#e63946", marginTop: 4, fontStyle: "italic" }}>Our system is unconvinced. It will reconsider shortly.</motion.p>}
                        </div>
                    )}
                    {activeField === "phone" && (
                        <div>
                            <label style={labelStyle}>Phone — Dialpad Only</label>
                            <Dialpad value={value.phone} onChange={v => onChange({ ...value, phone: v })} />
                        </div>
                    )}
                    {activeField === "notes" && (
                        <div>
                            <label style={labelStyle}>
                                Special Requests{" "}
                                <span style={{ color: "#bbb", fontWeight: 400, fontSize: "0.68rem" }}>(read probability: 12%)</span>
                            </label>
                            <AppendInput placeholder={NOTES_PH} value={value.notes} onChange={v => onChange({ ...value, notes: v })} asTextarea />
                            {value.notes.length > 60 && (
                                <p style={{ fontSize: "0.72rem", color: "#aaa", marginTop: 4, fontStyle: "italic" }}>We stopped reading at character 60. It looked great though.</p>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   STEP 5 — CAPTCHA: 3-round abstract image grid
══════════════════════════════════════════════════ */
const CAPTCHA_ROUNDS = [
    { prompt: "Select all squares that might contain a table", need: 3 },
    { prompt: "Select all squares that are definitely not a chair", need: 4 },
    { prompt: "Select squares where the lighting seems adequate for dining", need: 2 },
];
const PALETTE = [
    "#2a3a2a", "#3a2a2a", "#2a2a3a", "#3a3a2a", "#2a3a3a", "#3a2a3a",
    "#1a2a1a", "#2a1a1a", "#1a1a2a", "#252525", "#1e2828", "#281e1e",
    "#4a3020", "#203040", "#402030", "#304020", "#403020", "#204030",
    "#5a4030", "#305060", "#503040", "#405030", "#303050", "#503030",
];

const mkGrid = () => Array(9).fill(null).map(() => PALETTE[Math.floor(Math.random() * PALETTE.length)]);

const StepCaptcha = ({ onPass }) => {
    const [round, setRound] = useState(0);
    const [selected, setSelected] = useState([]);
    const [attempts, setAttempts] = useState(0);
    const [msg, setMsg] = useState(null);
    const [shake, setShake] = useState(false);
    const [checking, setChecking] = useState(false);
    const [passed, setPassed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);
    const [grid, setGrid] = useState(mkGrid);
    const cur = CAPTCHA_ROUNDS[Math.min(round, CAPTCHA_ROUNDS.length - 1)];

    useEffect(() => {
        if (passed) return;
        const iv = setInterval(() => setTimeLeft(t => {
            if (t <= 1) { setGrid(mkGrid()); setSelected([]); setMsg("Time's up. The images refreshed."); return 20; }
            return t - 1;
        }), 1000);
        return () => clearInterval(iv);
    }, [passed]);

    const toggle = (i) => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);

    const verify = () => {
        if (selected.length !== cur.need) {
            setShake(true); setTimeout(() => setShake(false), 500);
            setAttempts(a => a + 1);
            const msgs = [
                `We needed exactly ${cur.need}. You picked ${selected.length}.`,
                "Incorrect. Our AI is mildly disappointed.",
                "Still wrong. Perhaps try with fewer assumptions.",
                "The correct answer exists. You haven't found it yet.",
            ];
            setMsg(msgs[Math.min(attempts, msgs.length - 1)]);
            setSelected([]); setGrid(mkGrid()); setTimeLeft(20);
            return;
        }
        setChecking(true);
        setTimeout(() => {
            setChecking(false);
            if (round + 1 >= CAPTCHA_ROUNDS.length) { setPassed(true); setTimeout(onPass, 900); }
            else { setRound(r => r + 1); setSelected([]); setGrid(mkGrid()); setMsg(null); setTimeLeft(20); }
        }, 1800);
    };

    if (passed) return (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                <CheckCircle2 size={48} style={{ color: "#2d9e6a", margin: "0 auto 1rem" }} />
                <p style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem" }}>Humanity confirmed. Probably.</p>
            </motion.div>
        </div>
    );
    if (checking) return (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}>
                <Loader2 size={32} style={{ color: "#e63946" }} />
            </motion.div>
            <p style={{ marginTop: "1rem", fontStyle: "italic", color: "#888", fontSize: "0.85rem" }}>Verifying your humanity…</p>
        </div>
    );

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.72rem", color: "#aaa" }}>Round {round + 1} of {CAPTCHA_ROUNDS.length}</p>
                <span style={{ fontSize: "0.72rem", color: timeLeft < 6 ? "#e63946" : "#bbb" }}>{timeLeft}s</span>
            </div>
            <div style={{ height: 2, background: "#f0ecea", borderRadius: 2, overflow: "hidden", marginBottom: "1rem" }}>
                <motion.div key={timeLeft + "t" + round} animate={{ width: `${(timeLeft / 20) * 100}%` }} transition={{ duration: 0.9, ease: "linear" }}
                    style={{ height: "100%", background: timeLeft < 6 ? "#e63946" : "#1a1a1a", borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: "0.85rem", color: "#333", marginBottom: "0.4rem", fontFamily: "Georgia,serif" }}>{cur.prompt}</p>
            <p style={{ fontSize: "0.72rem", color: "#aaa", marginBottom: "1rem", fontStyle: "italic" }}>Select exactly {cur.need} square{cur.need !== 1 ? "s" : ""}.</p>
            <motion.div animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: "1rem" }}>
                    {grid.map((color, i) => (
                        <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => toggle(i)}
                            style={{ height: 72, borderRadius: 10, background: color, border: selected.includes(i) ? "3px solid #e63946" : "3px solid transparent", cursor: "pointer", position: "relative", overflow: "hidden", transition: "border-color 0.15s" }}>
                            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(255,255,255,0.03) 5px,rgba(255,255,255,0.03) 6px)", pointerEvents: "none" }} />
                            {selected.includes(i) && (
                                <div style={{ position: "absolute", inset: 0, background: "rgba(230,57,70,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <CheckCircle2 size={20} style={{ color: "white" }} />
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
            <button onClick={verify} style={{ ...primaryBtnStyle, width: "100%" }}>
                Verify ({selected.length}/{cur.need} selected)
            </button>
            {msg && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "#b0272c", fontStyle: "italic", textAlign: "center" }}>
                    {msg}{attempts > 0 ? ` (${attempts + 1} attempts)` : ""}
                </motion.p>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   STEP 6 — LOADING
══════════════════════════════════════════════════ */
const StepLoading = ({ onComplete }) => {
    const [phase, setPhase] = useState(0);
    const phases = [
        { label: "Contacting the kitchen…", ms: 2200 },
        { label: "Checking table availability…", ms: 2600 },
        { label: "Almost confirmed…", ms: 2000 },
        { label: "One final verification…", ms: 2400 },
        { label: "Finalising your reservation…", ms: 1800 },
    ];
    useEffect(() => {
        if (phase >= phases.length) { onComplete(); return; }
        const t = setTimeout(() => setPhase(p => p + 1), phases[phase].ms);
        return () => clearTimeout(t);
    }, [phase]);
    const pct = Math.round((phase / phases.length) * 100);
    return (
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block", marginBottom: "1.5rem" }}>
                <Loader2 size={36} style={{ color: "#e63946" }} />
            </motion.div>
            <AnimatePresence mode="wait">
                <motion.p key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    style={{ fontFamily: "Georgia, serif", fontSize: "1rem", color: "#1a1a1a", marginBottom: "0.5rem" }}>
                    {phase < phases.length ? phases[phase].label : "Done."}
                </motion.p>
            </AnimatePresence>
            <div style={{ height: 4, background: "#f0ecea", borderRadius: 2, overflow: "hidden", maxWidth: 280, margin: "1rem auto 0.5rem" }}>
                <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ height: "100%", background: "#e63946", borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: "0.72rem", color: "#aaa" }}>{pct}%</p>
            {phase === 3 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#bbb", fontStyle: "italic" }}>Your patience is our secret ingredient.</motion.p>}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   CLOSE SCREEN: 4-phase guilt trip
══════════════════════════════════════════════════ */
const FakeLeaveLoader = ({ onDone }) => {
    const [pct, setPct] = useState(0);
    useEffect(() => {
        const iv = setInterval(() => setPct(p => { if (p >= 100) { clearInterval(iv); onDone(); return 100; } return p + 3; }), 100);
        return () => clearInterval(iv);
    }, []);
    return (
        <div style={{ height: 3, background: "#f0ecea", borderRadius: 2, overflow: "hidden", maxWidth: 200, margin: "0 auto" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "#aaa", borderRadius: 2, transition: "width 0.1s linear" }} />
        </div>
    );
};

const CloseScreen = ({ onConfirm }) => {
    const [phase, setPhase] = useState(0);
    return (
        <div style={overlayStyle}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ ...modalStyle, textAlign: "center", padding: "2.5rem 2rem", maxWidth: 400 }}>
                <AnimatePresence mode="wait">
                    {phase === 0 && (
                        <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <ZoomIn size={40} style={{ color: "#e63946", margin: "0 auto 1rem" }} />
                            <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.4rem", margin: "0 0 0.75rem", color: "#1a1a1a" }}>Leave? Really?</h3>
                            <p style={{ color: "#888", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                                You were so close. The table was right there. The chef was practising your order in the mirror.
                            </p>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button onClick={() => setPhase(1)} style={{ flex: 1, ...primaryBtnStyle, background: "#555" }}>Yes, leave</button>
                                <button onClick={onConfirm} style={{ flex: 1, ...primaryBtnStyle }}>Actually, stay</button>
                            </div>
                        </motion.div>
                    )}
                    {phase === 1 && (
                        <motion.div key="guilt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", margin: "0 0 0.75rem", color: "#1a1a1a" }}>The table will remain empty.</h3>
                            <p style={{ color: "#888", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                                It will sit there with a "Reserved" sign nobody asked for.
                            </p>
                            <p style={{ color: "#bbb", fontSize: "0.78rem", lineHeight: 1.6, marginBottom: "1.5rem", fontStyle: "italic" }}>
                                The chef has been informed. He took it personally.
                            </p>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button onClick={() => setPhase(2)} style={{ flex: 1, ...primaryBtnStyle, background: "#777" }}>I must go</button>
                                <button onClick={onConfirm} style={{ flex: 1, ...primaryBtnStyle }}>Fine, I'll stay</button>
                            </div>
                        </motion.div>
                    )}
                    {phase === 2 && (
                        <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block", marginBottom: "1rem" }}>
                                <Loader2 size={32} style={{ color: "#aaa" }} />
                            </motion.div>
                            <p style={{ fontFamily: "Georgia,serif", fontSize: "1rem", color: "#555", marginBottom: "0.5rem" }}>Processing your decision to leave…</p>
                            <p style={{ color: "#bbb", fontSize: "0.75rem", fontStyle: "italic", marginBottom: "1.5rem" }}>This takes exactly as long as it takes.</p>
                            <FakeLeaveLoader onDone={() => setPhase(3)} />
                        </motion.div>
                    )}
                    {phase === 3 && (
                        <motion.div key="fine" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.4rem", margin: "0 0 0.75rem", color: "#1a1a1a" }}>Fine. Go.</h3>
                            <p style={{ color: "#888", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                                We released your table back into the wild. It found another family immediately. They seemed delighted.
                            </p>
                            <button onClick={onConfirm} style={{ ...primaryBtnStyle, width: "100%", background: "#1a1a1a" }}>
                                Close (we mean it this time)
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════════ */
const navBtnStyle = { background: "white", border: "1px solid #e8e2e2", borderRadius: 8, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" };
const labelStyle = { display: "block", fontSize: "0.78rem", fontWeight: 500, color: "#555", marginBottom: "0.4rem" };
const appendBase = { width: "100%", background: "white", border: "1px solid #e8e2e2", borderRadius: 12, padding: "0.65rem 0.9rem", fontSize: "0.88rem", color: "#1a1a1a", outline: "none", fontFamily: "inherit", boxSizing: "border-box", position: "relative", zIndex: 1 };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(15,10,10,0.6)", backdropFilter: "blur(5px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "'Nunito', -apple-system, sans-serif" };
const modalStyle = { background: "#f5f1f1", borderRadius: 24, padding: "2rem", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.22)", position: "relative" };
const primaryBtnStyle = { background: "#e63946", color: "white", border: "none", borderRadius: 100, padding: "0.7rem 1.75rem", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(230,57,70,0.25)" };

/* ══════════════════════════════════════════════════
   STEPS
══════════════════════════════════════════════════ */
const STEPS = [
    { title: "Pick a Date", subtitle: "Availability is a living document." },
    { title: "Select a Time", subtitle: "Speed is strongly recommended." },
    { title: "How Many Guests?", subtitle: "We reserve the right to recount." },
    { title: "Your Details", subtitle: "We need to know who to blame." },
    { title: "Prove You're Human", subtitle: "Our system has concerns." },
    { title: "Confirming…", subtitle: "This will take exactly as long as it takes." },
];

/* ══════════════════════════════════════════════════
   MAIN WIZARD
══════════════════════════════════════════════════ */
const BookTableWizard = ({ onClose }) => {
    const [step, setStep] = useState(0);
    const [done, setDone] = useState(false);
    const [showClose, setShowClose] = useState(false);
    const [captchaPassed, setCaptchaPassed] = useState(false);
    const [showTsunami, setShowTsunami] = useState(false);
    const [tsunamiKey, setTsunamiKey] = useState(0);
    const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
    const [missCount, setMissCount] = useState(0);
    const [randomPopup, setRandomPopup] = useState(null);
    const btnRef = useRef(null);

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [guests, setGuests] = useState(2);
    const [details, setDetails] = useState({ name: "", email: "", phone: "", notes: "" });

    // Tsunami every 10s
    useEffect(() => {
        const iv = setInterval(() => { setShowTsunami(true); setTsunamiKey(k => k + 1); }, 10000);
        return () => clearInterval(iv);
    }, []);

    // Random interruption popups
    const POPUPS = [
        "Our system just restarted. Your progress is safe. (Probably.)",
        "A staff member reviewed your booking. They have questions.",
        "73% of people give up at this step. You're still here.",
        "We updated our Privacy Policy. Nothing changed. Just wanted to mention it.",
        "Your session expires in 30 minutes. We reset that timer 4 times.",
    ];
    useEffect(() => {
        const iv = setInterval(() => {
            if (step < 5) { setRandomPopup(POPUPS[Math.floor(Math.random() * POPUPS.length)]); setTimeout(() => setRandomPopup(null), 4500); }
        }, 18000);
        return () => clearInterval(iv);
    }, [step]);

    const canProceed = () => {
        if (step === 0) return !!date;
        if (step === 1) return !!time;
        if (step === 2) return guests >= 1;
        if (step === 3) return details.name.trim().length > 1 && details.email.includes("@") && details.phone.length >= 6;
        if (step === 4) return captchaPassed;
        return false;
    };

    const handleNextHover = () => {
        if (!canProceed()) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 55 + Math.random() * 35;
            setBtnOffset(prev => ({
                x: Math.max(-110, Math.min(110, prev.x + Math.cos(angle) * dist)),
                y: Math.max(-55, Math.min(55, prev.y + Math.sin(angle) * dist)),
            }));
            setMissCount(m => m + 1);
        }
    };

    const handleNext = () => {
        if (!canProceed()) return;
        setBtnOffset({ x: 0, y: 0 });
        setStep(s => s + 1);
    };

    if (showClose) return <><RageCursor /><CloseScreen onConfirm={onClose} /></>;

    if (done) return (
        <>
            <RageCursor />
            <div style={overlayStyle}>
                <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{ ...modalStyle, textAlign: "center", padding: "3rem 2rem" }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                        <Utensils size={48} style={{ color: "#e63946", margin: "0 auto 1.5rem" }} />
                    </motion.div>
                    <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#1a1a1a", margin: "0 0 0.75rem" }}>Table Reserved.</h2>
                    <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "0.5rem" }}>
                        Table for <strong>{guests}</strong> on <strong>{date}</strong> at <strong>{time}</strong>.
                    </p>
                    <p style={{ color: "#bbb", fontSize: "0.78rem", fontStyle: "italic", marginBottom: "2rem" }}>
                        A confirmation email will arrive somewhere between now and never.
                    </p>
                    <button onClick={onClose} style={primaryBtnStyle}>Close</button>
                </motion.div>
            </div>
        </>
    );

    return (
        <>
            <RageCursor />

            <AnimatePresence>
                {showTsunami && <TsunamiWave key={tsunamiKey} onComplete={() => setShowTsunami(false)} />}
            </AnimatePresence>

            <AnimatePresence>
                {randomPopup && (
                    <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
                        style={{ position: "fixed", bottom: "2rem", right: "1.5rem", zIndex: 999997, background: "white", borderRadius: 14, padding: "0.9rem 1.2rem", maxWidth: 280, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "1px solid #ede8e8", fontSize: "0.8rem", color: "#555", lineHeight: 1.5 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <AlertCircle size={14} style={{ color: "#e63946", flexShrink: 0, marginTop: 1 }} />
                            <span>{randomPopup}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={overlayStyle}>
                <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 28 }} style={modalStyle}>

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <div>
                            <p style={{ fontSize: "0.72rem", color: "#e63946", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                                Step {step + 1} of {STEPS.length}
                            </p>
                            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.6rem", color: "#1a1a1a", margin: 0, lineHeight: 1.1 }}>{STEPS[step].title}</h2>
                            <p style={{ color: "#aaa", fontSize: "0.78rem", margin: "6px 0 0", fontStyle: "italic" }}>{STEPS[step].subtitle}</p>
                        </div>
                        <button onClick={() => setShowClose(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: 4, marginTop: 4 }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress */}
                    <div style={{ height: 2, background: "#f0ecea", borderRadius: 2, marginBottom: "1.75rem", overflow: "hidden" }}>
                        <motion.div animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.4, ease: "easeOut" }}
                            style={{ height: "100%", background: "#e63946", borderRadius: 2 }} />
                    </div>

                    {/* Content */}
                    <div style={{ minHeight: 300 }}>
                        <AnimatePresence mode="wait">
                            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
                                {step === 0 && <StepDate value={date} onChange={setDate} />}
                                {step === 1 && <StepTime value={time} onChange={setTime} />}
                                {step === 2 && <StepGuests value={guests} onChange={setGuests} />}
                                {step === 3 && <StepDetails value={details} onChange={setDetails} />}
                                {step === 4 && <StepCaptcha onPass={() => { setCaptchaPassed(true); setTimeout(() => setStep(5), 400); }} />}
                                {step === 5 && <StepLoading onComplete={() => setDone(true)} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Nav */}
                    {step < 4 && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.5rem", position: "relative" }}>
                            <button onClick={() => { setBtnOffset({ x: 0, y: 0 }); setStep(s => Math.max(0, s - 1)); }} disabled={step === 0}
                                style={{ background: "none", border: "1px solid #e8e2e2", borderRadius: 100, padding: "0.65rem 1.25rem", fontSize: "0.85rem", color: step === 0 ? "#ddd" : "#555", cursor: step === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                                <ChevronLeft size={14} /> Back
                            </button>
                            <motion.button ref={btnRef} animate={{ x: btnOffset.x, y: btnOffset.y }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                onMouseEnter={handleNextHover} onClick={handleNext}
                                style={{ ...primaryBtnStyle, display: "flex", alignItems: "center", gap: 6, opacity: canProceed() ? 1 : 0.85 }}>
                                {canProceed() ? "Continue" : "Not yet"}
                                <ChevronRight size={14} />
                            </motion.button>
                        </div>
                    )}
                    {missCount > 2 && (
                        <p style={{ textAlign: "right", fontSize: "0.68rem", color: "#ddd", marginTop: 6, fontStyle: "italic" }}>
                            {missCount} missed. The button is doing what it can.
                        </p>
                    )}
                </motion.div>
            </div>

            <style>{`* { cursor: none !important; }`}</style>
        </>
    );
};

export default BookTableWizard;