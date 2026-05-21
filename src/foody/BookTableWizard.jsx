import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight, ChevronLeft, CheckCircle2, AlertCircle,
    Loader2, X, Utensils, Delete, ZoomIn, Phone,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   RAGE CURSOR — grows with every click
══════════════════════════════════════════════════════════════ */
const RageCursor = () => {
    const [size, setSize] = useState(16);
    const [pos, setPos] = useState({ x: -300, y: -300 });
    const [burst, setBurst] = useState(false);
    useEffect(() => {
        const move = (e) => setPos({ x: e.clientX, y: e.clientY });
        const click = () => { setSize(s => Math.min(s + 16, 200)); setBurst(true); setTimeout(() => setBurst(false), 180); };
        window.addEventListener("mousemove", move);
        window.addEventListener("click", click);
        return () => { window.removeEventListener("mousemove", move); window.removeEventListener("click", click); };
    }, []);
    return (
        <div style={{
            position: "fixed", left: pos.x - size / 2, top: pos.y - size / 2,
            width: size, height: size, borderRadius: "50%",
            border: `${Math.max(2, size / 10)}px solid #e63946`,
            background: burst ? "rgba(230,57,70,0.15)" : "transparent",
            pointerEvents: "none", zIndex: 9999999,
            transition: "width 0.4s, height 0.4s, left 0.04s, top 0.04s",
        }} />
    );
};

/* ══════════════════════════════════════════════════════════════
   TSUNAMI WAVE
══════════════════════════════════════════════════════════════ */
const TsunamiWave = ({ onComplete }) => (
    <motion.div
        initial={{ x: "-110vw" }} animate={{ x: "110vw" }}
        transition={{ duration: 2.1, ease: [0.3, 0, 0.15, 1] }}
        onAnimationComplete={onComplete}
        style={{
            position: "fixed", inset: 0, zIndex: 9999990, pointerEvents: "none",
            background: "linear-gradient(185deg,rgba(10,55,140,0.95) 0%,rgba(5,28,80,0.98) 60%,rgba(2,12,45,1) 100%)"
        }}
    >
        <svg style={{ position: "absolute", right: -2, top: 0, height: "100%", width: 100 }} viewBox="0 0 100 900" preserveAspectRatio="none">
            <path d="M100,0 Q10,225 100,450 Q190,675 100,900 L100,900 L100,0Z" fill="rgba(10,55,140,0.95)" />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.9)", fontFamily: "Georgia,serif", fontSize: "1.3rem", fontStyle: "italic", letterSpacing: "0.05em" }}>
                Rearranging everything.
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Georgia,serif", fontSize: "0.85rem", marginTop: 8, fontStyle: "italic" }}>
                You're welcome.
            </p>
        </div>
    </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   ANNOYING POPUP — large, appears anywhere, must be dismissed
══════════════════════════════════════════════════════════════ */
const AnnoyPopup = ({ msg, onDismiss }) => {
    const left = 10 + Math.random() * 50;
    const top = 10 + Math.random() * 50;
    return (
        <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
                position: "fixed", left: `${left}%`, top: `${top}%`,
                zIndex: 9999980, background: "white", borderRadius: 20,
                padding: "2rem 2rem 1.5rem", maxWidth: 340, width: "90vw",
                boxShadow: "0 24px 60px rgba(0,0,0,0.22)", border: "1px solid #ede8e8",
                fontFamily: "'Nunito',-apple-system,sans-serif",
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "1.2rem" }}>
                <AlertCircle size={22} style={{ color: "#e63946", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: "0.95rem", color: "#333", lineHeight: 1.6, margin: 0 }}>{msg}</p>
            </div>
            <button onClick={onDismiss} style={{ width: "100%", background: "#1a1a1a", color: "white", border: "none", borderRadius: 100, padding: "0.7rem", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                Acknowledged
            </button>
        </motion.div>
    );
};

/* ══════════════════════════════════════════════════════════════
   TIMER POPUP — large, centred over the modal card
══════════════════════════════════════════════════════════════ */
const TimerPopup = ({ onClose }) => {
    const [t, setT] = useState(12);
    const msgs = [
        "Your reservation window closes in",
        "This form expires in",
        "Our patience runs out in",
        "The kitchen stops taking bookings in",
    ];
    const [msg] = useState(() => msgs[Math.floor(Math.random() * msgs.length)]);
    useEffect(() => {
        const iv = setInterval(() => setT(n => { if (n <= 1) { onClose(); return 0; } return n - 1; }), 1000);
        return () => clearInterval(iv);
    }, []);

    return (
        /* Sits inside the same overlay as the wizard — centred on top of the card */
        <motion.div
            initial={{ scale: 0.55, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{
                position: "fixed",
                /* horizontally centred, vertically centred with a slight upward bias */
                left: "50%", top: "50%",
                transform: "translate(-50%, -56%)",
                zIndex: 9999988,
                width: "min(420px, 92vw)",
                background: t < 5 ? "#fff0f0" : "white",
                border: `2px solid ${t < 5 ? "#e63946" : "#e0dada"}`,
                borderRadius: 24,
                padding: "2.5rem 2.25rem 2rem",
                boxShadow: "0 28px 70px rgba(0,0,0,0.28)",
                fontFamily: "'Nunito',-apple-system,sans-serif",
                textAlign: "center",
                transition: "background 0.3s, border-color 0.3s",
            }}
        >
            {/* Big countdown number */}
            <motion.div
                key={t}
                initial={{ scale: 1.35, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                    fontSize: "5rem", fontFamily: "Georgia,serif", fontWeight: 700,
                    color: t < 5 ? "#e63946" : "#1a1a1a", lineHeight: 1,
                    marginBottom: "0.6rem",
                }}
            >
                {t}
            </motion.div>

            {/* Thin progress drain bar */}
            <div style={{ height: 3, background: "#f0ecea", borderRadius: 2, overflow: "hidden", marginBottom: "1.1rem" }}>
                <motion.div
                    animate={{ width: `${(t / 12) * 100}%` }}
                    transition={{ duration: 0.9, ease: "linear" }}
                    style={{ height: "100%", background: t < 5 ? "#e63946" : "#1a1a1a", borderRadius: 2 }}
                />
            </div>

            <p style={{ fontSize: "0.92rem", color: "#666", margin: "0 0 1.6rem", fontStyle: "italic", lineHeight: 1.5 }}>
                {msg}
            </p>

            <button
                onClick={onClose}
                style={{
                    background: "#e63946", color: "white", border: "none", borderRadius: 100,
                    padding: "0.8rem 2rem", fontSize: "0.88rem", cursor: "pointer",
                    fontFamily: "inherit", fontWeight: 700, width: "100%",
                    boxShadow: "0 4px 16px rgba(230,57,70,0.25)",
                }}
            >
                I understand. Please stop.
            </button>
        </motion.div>
    );
};

/* ══════════════════════════════════════════════════════════════
   MINI SNAKE GAME — X button guard. Simple, clear, no rage cursor.
══════════════════════════════════════════════════════════════ */
const COLS = 8; const ROWS = 6; const CELL = 34;
const DIRS = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] };

const SnakeGame = ({ onComplete }) => {
    const initSnake = [[4, 4], [3, 4], [2, 4]];
    const [snake, setSnake] = useState(initSnake);
    const [food, setFood] = useState([7, 2]);
    const [score, setScore] = useState(0);
    const [dead, setDead] = useState(false);
    const [won, setWon] = useState(false);
    const [started, setStarted] = useState(false);
    const dRef = useRef("RIGHT");

    const randFood = (s) => {
        let f;
        do { f = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)]; }
        while (s.some(([x, y]) => x === f[0] && y === f[1]));
        return f;
    };

    // Keyboard
    useEffect(() => {
        const onKey = (e) => {
            const map = { ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT" };
            if (map[e.key]) { e.preventDefault(); dRef.current = map[e.key]; if (!started) setStarted(true); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [started]);

    // Game loop — only runs when started
    useEffect(() => {
        if (!started || dead || won) return;
        const iv = setInterval(() => {
            setSnake(prev => {
                const [dx, dy] = DIRS[dRef.current];
                const head = [prev[0][0] + dx, prev[0][1] + dy];
                if (head[0] < 0 || head[0] >= COLS || head[1] < 0 || head[1] >= ROWS) { setDead(true); return prev; }
                if (prev.some(([x, y]) => x === head[0] && y === head[1])) { setDead(true); return prev; }
                let next = [head, ...prev];
                if (head[0] === food[0] && head[1] === food[1]) {
                    setScore(sc => { const ns = sc + 1; if (ns >= 2) setTimeout(() => setWon(true), 250); return ns; });
                    setFood(randFood(next));
                } else { next = next.slice(0, -1); }
                return next;
            });
        }, 260); // slower = easier
        return () => clearInterval(iv);
    }, [started, dead, won, food]);

    const reset = () => {
        setSnake(initSnake); dRef.current = "RIGHT";
        setScore(0); setDead(false); setWon(false); setStarted(false); setFood([7, 2]);
    };

    const press = (dir) => { dRef.current = dir; if (!started) setStarted(true); };

    return (
        <div style={{ fontFamily: "'Nunito',-apple-system,sans-serif", textAlign: "center" }}>

            {/* Title */}
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.25rem", margin: "0 0 0.25rem", color: "#1a1a1a" }}>Not so fast.</h3>
            <p style={{ color: "#888", fontSize: "0.78rem", marginBottom: "0.9rem", fontStyle: "italic" }}>
                Collect 2 plates to unlock the exit.
            </p>

            {/* Legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.7rem", color: "#777" }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: "#e63946" }} /> You
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.7rem", color: "#777" }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#1a1a1a" }} /> Collect
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.7rem", color: "#777" }}>
                    <div style={{ width: 14, height: 14, borderRadius: 2, background: "#f5b3b8" }} /> Body (avoid)
                </div>
            </div>

            {/* Score dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: "0.75rem" }}>
                {[0, 1].map(i => (
                    <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #e63946", background: i < score ? "#e63946" : "transparent", transition: "background 0.2s" }} />
                ))}
            </div>

            {/* Board */}
            <div style={{ display: "inline-block", border: "2px solid #e8e2e2", borderRadius: 12, overflow: "hidden", background: "#faf8f8", marginBottom: "0.8rem", position: "relative" }}>
                {!started && !dead && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(245,241,241,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, borderRadius: 10 }}>
                        <p style={{ fontFamily: "Georgia,serif", fontSize: "0.9rem", color: "#555", fontStyle: "italic" }}>Tap an arrow to start</p>
                    </div>
                )}
                {Array(ROWS).fill(null).map((_, row) => (
                    <div key={row} style={{ display: "flex" }}>
                        {Array(COLS).fill(null).map((_, col) => {
                            const isHead = snake[0][0] === col && snake[0][1] === row;
                            const isBody = snake.slice(1).some(([x, y]) => x === col && y === row);
                            const isFood = food[0] === col && food[1] === row;
                            return (
                                <div key={col} style={{
                                    width: CELL, height: CELL,
                                    background: isHead ? "#e63946" : isBody ? "#f5b3b8" : isFood ? "#1a1a1a" : "transparent",
                                    borderRadius: isHead ? 6 : isBody ? 3 : isFood ? "50%" : 0,
                                    transition: "background 0.06s",
                                }} />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* D-pad — big and obvious */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 52px)", gridTemplateRows: "repeat(2, 52px)", gap: 5, margin: "0 auto 0.9rem", width: "fit-content" }}>
                {/* Row 1: empty, UP, empty */}
                <div />
                <button onClick={() => press("UP")} style={dpadBtn}>↑</button>
                <div />
                {/* Row 2: LEFT, DOWN, RIGHT */}
                <button onClick={() => press("LEFT")} style={dpadBtn}>←</button>
                <button onClick={() => press("DOWN")} style={dpadBtn}>↓</button>
                <button onClick={() => press("RIGHT")} style={dpadBtn}>→</button>
            </div>

            {/* States */}
            {won && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <p style={{ color: "#2d9e6a", fontFamily: "Georgia,serif", fontSize: "0.95rem", marginBottom: "0.6rem" }}>
                        Fine. You earned it. (We're impressed. A little.)
                    </p>
                    <button onClick={onComplete} style={{ background: "#1a1a1a", color: "white", border: "none", borderRadius: 100, padding: "0.65rem 2rem", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                        Go Home
                    </button>
                </motion.div>
            )}
            {dead && !won && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p style={{ color: "#e63946", fontSize: "0.8rem", fontStyle: "italic", marginBottom: "0.5rem" }}>
                        You hit the wall. Or yourself. Classic.
                    </p>
                    <button onClick={reset} style={{ background: "#e63946", color: "white", border: "none", borderRadius: 100, padding: "0.6rem 1.5rem", fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                        Try Again
                    </button>
                </motion.div>
            )}
            {!won && !dead && (
                <p style={{ fontSize: "0.68rem", color: "#bbb", fontStyle: "italic" }}>
                    Tap arrows above · or use keyboard arrow keys
                </p>
            )}
        </div>
    );
};

const dpadBtn = {
    width: 52, height: 52, borderRadius: 12, border: "1.5px solid #e8e2e2",
    background: "white", cursor: "pointer", fontSize: "1.2rem", fontWeight: 700,
    color: "#333", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)", fontFamily: "inherit",
    transition: "background 0.1s",
};

/* ══════════════════════════════════════════════════════════════
   COOKING GAME — shown on success "Close" button
   Tap ingredients in the correct order to cook the dish.
══════════════════════════════════════════════════════════════ */
const RECIPES = [
    {
        name: "Spaghetti Aglio e Olio",
        steps: ["Boil water", "Add pasta", "Heat olive oil", "Add garlic", "Toss pasta", "Add parsley", "Plate it"],
        emoji: ["Pot", "Pasta", "Oil", "Garlic", "Fork", "Herb", "Plate"],
        icons: ["○", "≋", "◉", "◈", "⌂", "❋", "▣"],
    },
    {
        name: "Classic Bruschetta",
        steps: ["Slice bread", "Grill bread", "Chop tomatoes", "Add basil", "Add olive oil", "Top bread", "Serve"],
        emoji: ["Bread", "Grill", "Tomato", "Basil", "Oil", "Stack", "Serve"],
        icons: ["▭", "≋", "◉", "❋", "◉", "▣", "✓"],
    },
];

const CookingGame = ({ onComplete }) => {
    const [recipe] = useState(() => RECIPES[Math.floor(Math.random() * RECIPES.length)]);
    const [current, setCurrent] = useState(0);
    const [done, setDone] = useState(false);
    const [wrong, setWrong] = useState(null);
    const [ripple, setRipple] = useState(null);

    // Scramble available taps — show 3 options, only one is correct
    const [choices, setChoices] = useState([]);

    const buildChoices = (idx) => {
        const correct = idx;
        const others = recipe.steps.map((_, i) => i).filter(i => i !== correct && i !== idx - 1);
        const picks = others.sort(() => Math.random() - 0.5).slice(0, 2);
        const all = [correct, ...picks].sort(() => Math.random() - 0.5);
        setChoices(all);
    };

    useEffect(() => { buildChoices(0); }, []);

    const tap = (idx) => {
        if (idx === current) {
            setRipple(idx);
            setTimeout(() => setRipple(null), 350);
            const next = current + 1;
            if (next >= recipe.steps.length) { setTimeout(() => setDone(true), 400); }
            else { setCurrent(next); buildChoices(next); }
            setWrong(null);
        } else {
            setWrong(idx);
            setTimeout(() => setWrong(null), 600);
        }
    };

    if (done) return (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} style={{ textAlign: "center", padding: "1rem 0" }}>
            <p style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", color: "#1a1a1a", marginBottom: "0.5rem" }}>
                "{recipe.name}" — done.
            </p>
            <p style={{ color: "#888", fontSize: "0.8rem", fontStyle: "italic", marginBottom: "1.5rem" }}>
                The chef is moderately impressed. You may leave now.
            </p>
            <button onClick={onComplete} style={{ background: "#e63946", color: "white", border: "none", borderRadius: 100, padding: "0.8rem 2.5rem", fontSize: "0.88rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, boxShadow: "0 4px 16px rgba(230,57,70,0.25)" }}>
                Finally, go home
            </button>
        </motion.div>
    );

    return (
        <div style={{ fontFamily: "'Nunito',-apple-system,sans-serif" }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.15rem", margin: "0 0 0.2rem", color: "#1a1a1a", textAlign: "center" }}>
                Cook before you leave.
            </h3>
            <p style={{ color: "#888", fontSize: "0.75rem", textAlign: "center", fontStyle: "italic", marginBottom: "1rem" }}>
                The chef insists. Tap the steps in order.
            </p>

            {/* Recipe name */}
            <div style={{ background: "white", border: "1px solid #ede8e8", borderRadius: 12, padding: "0.6rem 1rem", marginBottom: "1rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.82rem", color: "#555", margin: 0, fontStyle: "italic" }}>Tonight's dish:</p>
                <p style={{ fontFamily: "Georgia,serif", fontSize: "1rem", color: "#1a1a1a", margin: "3px 0 0", fontWeight: 500 }}>{recipe.name}</p>
            </div>

            {/* Progress bar of steps */}
            <div style={{ display: "flex", gap: 4, marginBottom: "1rem" }}>
                {recipe.steps.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < current ? "#e63946" : i === current ? "#f5b3b8" : "#f0ecea", transition: "background 0.3s" }} />
                ))}
            </div>

            {/* Current instruction */}
            <AnimatePresence mode="wait">
                <motion.div key={current} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                    style={{ background: "#1a1a1a", borderRadius: 14, padding: "1rem 1.25rem", marginBottom: "1rem", textAlign: "center" }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.68rem", margin: "0 0 4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Step {current + 1} of {recipe.steps.length}</p>
                    <p style={{ color: "white", fontFamily: "Georgia,serif", fontSize: "1rem", margin: 0 }}>{recipe.steps[current]}</p>
                </motion.div>
            </AnimatePresence>

            {/* Three choice buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {choices.map((idx) => (
                    <motion.button
                        key={idx + "-" + current}
                        animate={wrong === idx ? { x: [-6, 6, -6, 6, 0] } : ripple === idx ? { scale: [1, 1.04, 1] } : {}}
                        onClick={() => tap(idx)}
                        style={{
                            padding: "0.8rem 1rem", borderRadius: 12, border: "1.5px solid",
                            borderColor: wrong === idx ? "#e63946" : ripple === idx ? "#2d9e6a" : "#e8e2e2",
                            background: wrong === idx ? "#fff0f0" : ripple === idx ? "#f0faf5" : "white",
                            color: "#1a1a1a", fontSize: "0.88rem", cursor: "pointer",
                            fontFamily: "inherit", fontWeight: 500, textAlign: "left",
                            display: "flex", alignItems: "center", gap: 10,
                            transition: "border-color 0.15s, background 0.15s",
                        }}
                    >
                        <span style={{ width: 28, height: 28, borderRadius: 8, background: "#f5f1f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", color: "#888", flexShrink: 0 }}>
                            {String.fromCharCode(65 + choices.indexOf(idx))}
                        </span>
                        {recipe.steps[idx]}
                    </motion.button>
                ))}
            </div>

            {wrong !== null && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: "0.6rem", fontSize: "0.74rem", color: "#e63946", textAlign: "center", fontStyle: "italic" }}>
                    That's not next. The chef is watching.
                </motion.p>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   STEP 1 — DATE: violently wiggling cells + infinite load
══════════════════════════════════════════════════════════════ */
const WiggleCell = ({ day, isPast, isBlocked, isSelected, onClick }) => {
    const phase = useRef(Math.random() * Math.PI * 2);
    const freq = useRef(9 + Math.random() * 9);
    const amp = useRef(isPast ? 1.5 : isBlocked ? 7 : 5);
    const [rot, setRot] = useState(0);
    const [tx, setTx] = useState(0);

    useEffect(() => {
        let f;
        const tick = (t) => {
            setRot(Math.sin(t / (1000 / freq.current) + phase.current) * amp.current);
            setTx(Math.cos(t / (850 / freq.current) + phase.current) * (amp.current * 0.4));
            f = requestAnimationFrame(tick);
        };
        f = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(f);
    }, []);

    return (
        <button onClick={onClick} style={{
            padding: "7px 0", borderRadius: 8,
            border: isSelected ? "2px solid #e63946" : "1px solid transparent",
            background: isSelected ? "#e63946" : isPast || isBlocked ? "#f0ecea" : "white",
            color: isSelected ? "white" : isPast || isBlocked ? "#ccc" : "#1a1a1a",
            fontSize: "0.8rem", cursor: isPast ? "not-allowed" : isBlocked ? "wait" : "pointer",
            fontWeight: isSelected ? 600 : 400,
            transform: `rotate(${rot}deg) translateX(${tx}px)`,
            display: "inline-block", fontFamily: "inherit",
        }}>{day}</button>
    );
};

const StepDate = ({ value, onChange }) => {
    const [blocked, setBlocked] = useState([]);
    const [tooltip, setTooltip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadIdx, setLoadIdx] = useState(0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [vm, setVm] = useState(today.getMonth());
    const [vy, setVy] = useState(today.getFullYear());
    const loadMsgs = ["Checking availability…", "Still checking…", "Contacting calendar servers…", "Almost there…", "Re-verifying from scratch…", "Our server sneezed. Retrying…", "Loading complete. Reloading for safety…"];

    useEffect(() => {
        const pick = () => {
            const b = new Set();
            while (b.size < 8) { const d = new Date(today); d.setDate(today.getDate() + Math.floor(Math.random() * 28) + 1); b.add(d.toISOString().split("T")[0]); }
            setBlocked([...b]);
        };
        pick(); const iv = setInterval(pick, 5500); return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        if (!loading) return;
        const iv = setInterval(() => setLoadIdx(m => (m + 1) % loadMsgs.length), 2000);
        return () => clearInterval(iv);
    }, [loading]);

    const dim = new Date(vy, vm + 1, 0).getDate();
    const fd = new Date(vy, vm, 1).getDay();

    const clickDay = (day) => {
        const d = new Date(vy, vm, day); const iso = d.toISOString().split("T")[0];
        if (d < today) { setTooltip("That's in the past. Even we can't undo time."); setTimeout(() => setTooltip(null), 2500); return; }
        if (blocked.includes(iso)) {
            setLoading(true);
            setTimeout(() => { setLoading(false); setTooltip("Still fully booked. We checked 7 times."); setTimeout(() => setTooltip(null), 3000); }, 7000);
            return;
        }
        onChange(iso);
    };

    if (loading) return (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block", marginBottom: "1.25rem" }}>
                <Loader2 size={36} style={{ color: "#e63946" }} />
            </motion.div>
            <AnimatePresence mode="wait">
                <motion.p key={loadIdx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", color: "#555", margin: "0 0 1.5rem" }}>
                    {loadMsgs[loadIdx]}
                </motion.p>
            </AnimatePresence>
            <div style={{ height: 3, background: "#f0ecea", borderRadius: 2, overflow: "hidden", maxWidth: 200, margin: "0 auto 0.75rem" }}>
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: "55%", height: "100%", background: "#e63946", borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: "0.68rem", color: "#bbb", fontStyle: "italic" }}>Not a progress bar. Moral support.</p>
        </div>
    );

    return (
        <div>
            <p style={{ color: "#888", fontSize: "0.76rem", marginBottom: "0.75rem", fontStyle: "italic" }}>Availability shifts every few seconds. The calendar is anxious.</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <button onClick={() => vm === 0 ? (setVm(11), setVy(y => y - 1)) : setVm(m => m - 1)} style={navBtnStyle}><ChevronLeft size={15} /></button>
                <span style={{ fontFamily: "Georgia,serif", fontWeight: 500 }}>{months[vm]} {vy}</span>
                <button onClick={() => vm === 11 ? (setVm(0), setVy(y => y + 1)) : setVm(m => m + 1)} style={navBtnStyle}><ChevronRight size={15} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 5 }}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d} style={{ textAlign: "center", fontSize: "0.68rem", color: "#bbb", padding: "3px 0" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
                {Array(fd).fill(null).map((_, i) => <div key={"e" + i} />)}
                {Array(dim).fill(null).map((_, i) => {
                    const day = i + 1; const d = new Date(vy, vm, day); const iso = d.toISOString().split("T")[0];
                    return <WiggleCell key={iso} day={day} isPast={d < today} isBlocked={blocked.includes(iso)} isSelected={value === iso} onClick={() => clickDay(day)} />;
                })}
            </div>
            <AnimatePresence>
                {tooltip && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ marginTop: "0.75rem", background: "#fff3f3", border: "1px solid #f5c5c5", borderRadius: 10, padding: "0.55rem 0.9rem", fontSize: "0.8rem", color: "#b0272c" }}>
                        <AlertCircle size={13} style={{ display: "inline", marginRight: 5, verticalAlign: -2 }} />{tooltip}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   STEP 2 — TIME: slots shrink + drift + vanish over time
══════════════════════════════════════════════════════════════ */
const ALL_TIMES = ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"];

const StepTime = ({ value, onChange }) => {
    const [slots, setSlots] = useState(() => ALL_TIMES.map(t => ({ time: t, scale: 1, x: 0, y: 0, gone: false })));
    const [note, setNote] = useState(null);

    useEffect(() => {
        const s1 = setInterval(() => {
            setSlots(prev => {
                const avail = prev.filter(s => !s.gone && s.time !== value);
                if (!avail.length) return prev;
                const v = avail[Math.floor(Math.random() * avail.length)];
                return prev.map(s => s.time === v.time ? { ...s, scale: Math.max(0.5, s.scale - 0.13), x: (Math.random() - .5) * 14, y: (Math.random() - .5) * 8 } : s);
            });
        }, 2600);
        const s2 = setInterval(() => {
            setSlots(prev => {
                const tiny = prev.filter(s => !s.gone && s.scale < 0.68 && s.time !== value);
                if (!tiny.length) return prev;
                const v = tiny[Math.floor(Math.random() * tiny.length)];
                setNote(`${v.time} just left. It looked tired.`);
                setTimeout(() => setNote(null), 2500);
                return prev.map(s => s.time === v.time ? { ...s, gone: true } : s);
            });
        }, 6500);
        return () => { clearInterval(s1); clearInterval(s2); };
    }, [value]);

    return (
        <div>
            <p style={{ color: "#888", fontSize: "0.76rem", marginBottom: "1rem", fontStyle: "italic" }}>Slots are disappearing. Hurry.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9 }}>
                {slots.map(s => {
                    const sel = value === s.time;
                    if (s.gone && !sel) return (
                        <div key={s.time} style={{ padding: "0.7rem", borderRadius: 12, background: "#fafafa", border: "1px dashed #eee", fontSize: "0.7rem", color: "#ddd", textDecoration: "line-through", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.time}</div>
                    );
                    return (
                        <motion.button key={s.time} onClick={() => !s.gone && onChange(s.time)}
                            animate={{ scale: sel ? 1 : s.scale, x: s.x, y: s.y }} transition={{ type: "spring", stiffness: 200, damping: 18 }}
                            style={{ padding: "0.7rem 0.5rem", borderRadius: 12, border: sel ? "2px solid #e63946" : `1px solid ${s.scale < 0.75 ? "#f5c5c5" : "#e8e2e2"}`, background: sel ? "#e63946" : "white", color: sel ? "white" : s.scale < 0.75 ? "#b0272c" : "#1a1a1a", fontSize: `${Math.max(0.6, 0.86 * s.scale)}rem`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: sel ? 600 : 400, fontFamily: "inherit" }}>
                            <span style={{ fontSize: "0.7em", opacity: 0.35 }}>◷</span>
                            <span>{s.time}</span>
                            {sel ? <CheckCircle2 size={12} /> : s.scale < 0.78 ? <span style={{ fontSize: "0.58rem", color: "#e63946" }}>Fading</span> : <span />}
                        </motion.button>
                    );
                })}
            </div>
            <AnimatePresence>
                {note && <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: "0.65rem", fontSize: "0.76rem", color: "#b0272c", fontStyle: "italic" }}>{note}</motion.p>}
            </AnimatePresence>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   STEP 3 — GUESTS: slider blocked by obstacles
══════════════════════════════════════════════════════════════ */
const StepGuests = ({ value, onChange }) => {
    const [warning, setWarning] = useState(null);
    const [obstacle, setObstacle] = useState(null);
    const [locked, setLocked] = useState(false);
    const notes = { 1: "One person. The table will be judged.", 2: "Two. We'll seat you near the kitchen.", 3: "Three is an odd number. Literally.", 4: "Four. Our computers can handle four.", 5: "Five? We need to find five chairs first.", 6: "Six. This is getting complicated.", 7: "Seven. Are you sure? Count again.", 8: "Eight. We will call you. Or not." };

    useEffect(() => {
        const obs = ["Wet floor", "Staff crossing", "Menu trolley", "Chef passing", "Table being set", "Sommelier incident"];
        const iv = setInterval(() => {
            const lbl = obs[Math.floor(Math.random() * obs.length)];
            setObstacle({ label: lbl, x: 15 + Math.random() * 70 }); setLocked(true);
            setWarning(`Slider blocked: ${lbl}. Please wait.`);
            setTimeout(() => { setObstacle(null); setLocked(false); setWarning(null); }, 3500);
        }, 5500);
        return () => clearInterval(iv);
    }, []);

    const handleChange = (e) => {
        if (locked) { setWarning("The slider is currently indisposed."); return; }
        let v = parseInt(e.target.value);
        if (Math.random() < 0.35 && v > 1) { v--; setWarning("The slider had a moment of self-doubt."); setTimeout(() => setWarning(null), 2500); }
        onChange(v);
    };

    return (
        <div>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <motion.div key={value} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{ fontSize: "3.5rem", fontFamily: "Georgia,serif", fontWeight: 700, color: "#e63946", lineHeight: 1 }}>{value}</motion.div>
                <p style={{ fontSize: "0.78rem", color: "#888", marginTop: 4 }}>guests</p>
            </div>
            <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                <input type="range" min={1} max={8} value={value} onChange={handleChange}
                    style={{ width: "100%", accentColor: "#e63946", cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.4 : 1 }} />
                <AnimatePresence>
                    {obstacle && (
                        <motion.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0 }}
                            style={{ position: "absolute", top: "50%", left: `${obstacle.x}%`, transform: "translate(-50%,-50%)", background: "#1a1a1a", color: "white", fontSize: "0.6rem", padding: "3px 8px", borderRadius: 100, whiteSpace: "nowrap", pointerEvents: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                            {obstacle.label}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#aaa", marginBottom: "1.2rem" }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <span key={n} style={{ color: n === value ? "#e63946" : "#ccc", fontWeight: n === value ? 700 : 400 }}>{n}</span>)}
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={value} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    style={{ background: "white", border: "1px solid #ede8e8", borderRadius: 12, padding: "0.7rem 1rem", fontSize: "0.8rem", color: "#555", fontStyle: "italic" }}>
                    {notes[value]}
                </motion.div>
            </AnimatePresence>
            {warning && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ marginTop: "0.7rem", fontSize: "0.76rem", color: "#b0272c" }}>
                    <AlertCircle size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />{warning}
                </motion.p>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   STEP 4 — DETAILS: appending placeholders + collapsible dialpad
══════════════════════════════════════════════════════════════ */
const NAME_PH = "Your full legal name as it appears on government-issued ID";
const EMAIL_PH = "youremail@example.com (we will not spam. much.)";
const NOTES_PH = "Special requests, dietary restrictions, unreasonable expectations, life stories…";

const AppendInput = ({ placeholder, value, onChange, asTextarea = false }) => (
    <div style={{ position: "relative" }}>
        {asTextarea
            ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={4} style={{ ...appendBase, resize: "none", minHeight: 88, fontFamily: "inherit" }} placeholder="" />
            : <input value={value} onChange={e => onChange(e.target.value)} style={appendBase} placeholder="" />
        }
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, padding: "0.62rem 0.9rem", fontSize: "0.88rem", pointerEvents: "none", display: "flex", alignItems: asTextarea ? "flex-start" : "center", overflow: "hidden", whiteSpace: asTextarea ? "pre-wrap" : "nowrap" }}>
            <span style={{ color: "transparent", whiteSpace: "pre" }}>{value}</span>
            <span style={{ color: "#c0b8b8", fontStyle: "italic" }}>{placeholder.slice(value.length)}</span>
        </div>
    </div>
);

/* Dialpad — hidden, must open each time, tiny buttons, wrong layout */
const Dialpad = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    // Shuffled key layout — every time you open it shuffles
    const [layout, setLayout] = useState(["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"]);

    const openPad = () => {
        // Shuffle every time it opens
        const shuffled = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].sort(() => Math.random() - 0.5);
        setLayout(shuffled);
        setOpen(true);
    };

    const press = (k) => {
        if (k === "*") { setOpen(false); return; } // * closes the pad
        if (k === "#") { onChange(value.slice(0, -1)); return; }
        if (value.length < 13) onChange(value + k);
        // Close pad after each digit — user must reopen for every digit
        setOpen(false);
    };

    return (
        <div>
            {/* Display */}
            <div style={{ background: "white", border: "1px solid #e8e2e2", borderRadius: 12, padding: "0.7rem 1rem", marginBottom: "0.5rem", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: "Georgia,serif", letterSpacing: "0.2em", fontSize: "1rem", color: "#1a1a1a", flex: 1 }}>
                    {value || <span style={{ color: "#ccc", fontSize: "0.78rem", fontFamily: "inherit", fontStyle: "italic", letterSpacing: 0 }}>Tap the button to enter each digit</span>}
                </span>
                <button onClick={() => value.length > 0 && onChange(value.slice(0, -1))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: 4 }}>
                    <Delete size={14} />
                </button>
            </div>

            <p style={{ fontSize: "0.68rem", color: "#aaa", marginBottom: "0.6rem", fontStyle: "italic" }}>
                Keyboard is disabled. Open the pad for each digit. (* closes it.)
            </p>

            <button onClick={openPad}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #e8e2e2", borderRadius: 12, padding: "0.6rem 1.1rem", fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit", color: "#555", width: "100%" }}>
                <Phone size={14} style={{ color: "#e63946" }} />
                Open Number Pad — Enter Digit {value.length + 1}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{ marginTop: "0.75rem", background: "#f9f6f6", border: "1px solid #e8e2e2", borderRadius: 16, padding: "1rem", boxShadow: "0 8px 30px rgba(0,0,0,0.1)" }}>
                        <p style={{ fontSize: "0.68rem", color: "#aaa", textAlign: "center", marginBottom: "0.75rem", fontStyle: "italic" }}>
                            Layout shuffles every time. That's a feature.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                            {layout.map((k, i) => (
                                <motion.button key={i} whileTap={{ scale: 0.84 }} onClick={() => press(k)}
                                    style={{
                                        padding: "0.75rem 0", borderRadius: 10, border: "1px solid #e8e2e2",
                                        background: k === "*" ? "#fff0f0" : k === "#" ? "#fff3f3" : "white",
                                        color: k === "*" ? "#e63946" : k === "#" ? "#888" : "#1a1a1a",
                                        fontSize: "0.95rem", fontWeight: 500, cursor: "pointer",
                                        fontFamily: "Georgia,serif",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                    {k === "*" ? <X size={14} /> : k === "#" ? <Delete size={14} /> : k}
                                </motion.button>
                            ))}
                        </div>
                        <p style={{ fontSize: "0.65rem", color: "#ccc", textAlign: "center", marginTop: "0.6rem", fontStyle: "italic" }}>* = close pad without entering</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StepDetails = ({ value, onChange }) => {
    const [emailState, setEmailState] = useState("idle");
    const [active, setActive] = useState("name");
    const timerRef = useRef(null);

    const handleEmail = (v) => {
        onChange({ ...value, email: v });
        clearTimeout(timerRef.current);
        if (v.includes("@") && v.includes(".")) {
            setEmailState("checking");
            timerRef.current = setTimeout(() => { setEmailState("wrong"); setTimeout(() => setEmailState("ok"), 3500); }, 2200);
        } else setEmailState("idle");
    };

    const fields = [{ id: "name", label: "Full Name" }, { id: "email", label: "Email" }, { id: "phone", label: "Phone" }, { id: "notes", label: "Requests" }];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            <p style={{ color: "#888", fontSize: "0.76rem", fontStyle: "italic", margin: "0 0 0.2rem" }}>This is the easy part. Or so we let you believe.</p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {fields.map(f => (
                    <button key={f.id} onClick={() => setActive(f.id)}
                        style={{ padding: "0.32rem 0.8rem", borderRadius: 100, border: "none", background: active === f.id ? "#1a1a1a" : "#ede8e8", color: active === f.id ? "white" : "#888", fontSize: "0.73rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all 0.15s" }}>
                        {f.label}
                    </button>
                ))}
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: 0.17 }}>
                    {active === "name" && (
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <AppendInput placeholder={NAME_PH} value={value.name} onChange={v => onChange({ ...value, name: v })} />
                            {value.name.length > 0 && value.name.length < 4 && <p style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 3, fontStyle: "italic" }}>That seems short for a full legal name.</p>}
                        </div>
                    )}
                    {active === "email" && (
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ position: "relative" }}>
                                <AppendInput placeholder={EMAIL_PH} value={value.email} onChange={handleEmail} />
                                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
                                    {emailState === "checking" && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Loader2 size={13} style={{ color: "#aaa" }} /></motion.div>}
                                    {emailState === "wrong" && <AlertCircle size={13} style={{ color: "#e63946" }} />}
                                    {emailState === "ok" && <CheckCircle2 size={13} style={{ color: "#2d9e6a" }} />}
                                </div>
                            </div>
                            {emailState === "wrong" && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: "0.7rem", color: "#e63946", marginTop: 3, fontStyle: "italic" }}>Our system is unconvinced. It will reconsider shortly.</motion.p>}
                        </div>
                    )}
                    {active === "phone" && (
                        <div>
                            <label style={labelStyle}>Phone — One Digit At A Time</label>
                            <Dialpad value={value.phone} onChange={v => onChange({ ...value, phone: v })} />
                        </div>
                    )}
                    {active === "notes" && (
                        <div>
                            <label style={labelStyle}>Special Requests <span style={{ color: "#bbb", fontWeight: 400, fontSize: "0.68rem" }}>(read probability: 12%)</span></label>
                            <AppendInput placeholder={NOTES_PH} value={value.notes} onChange={v => onChange({ ...value, notes: v })} asTextarea />
                            {value.notes.length > 60 && <p style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 3, fontStyle: "italic" }}>We stopped reading at character 60. It looked great though.</p>}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   STEP 5 — CAPTCHA: 3-round abstract image grid
══════════════════════════════════════════════════════════════ */
const ROUNDS = [
    { prompt: "Select all squares that might contain a table", need: 3 },
    { prompt: "Select all squares that are definitely not a chair", need: 4 },
    { prompt: "Select squares where the lighting seems adequate for dining", need: 2 },
];
const PALETTE = ["#2a3a2a", "#3a2a2a", "#2a2a3a", "#3a3a2a", "#2a3a3a", "#3a2a3a", "#1a2a1a", "#2a1a1a", "#1a1a2a", "#252525", "#1e2828", "#281e1e", "#4a3020", "#203040", "#402030", "#304020", "#403020", "#204030", "#5a4030", "#305060", "#503040", "#405030", "#303050", "#503030"];
const mkGrid = () => Array(9).fill(null).map(() => PALETTE[Math.floor(Math.random() * PALETTE.length)]);

const StepCaptcha = ({ onPass }) => {
    const [round, setRound] = useState(0);
    const [sel, setSel] = useState([]);
    const [attempts, setAttempts] = useState(0);
    const [msg, setMsg] = useState(null);
    const [shake, setShake] = useState(false);
    const [checking, setChecking] = useState(false);
    const [passed, setPassed] = useState(false);
    const [t, setT] = useState(20);
    const [grid, setGrid] = useState(mkGrid);
    const cur = ROUNDS[Math.min(round, ROUNDS.length - 1)];

    useEffect(() => {
        if (passed) return;
        const iv = setInterval(() => setT(n => { if (n <= 1) { setGrid(mkGrid()); setSel([]); setMsg("Time's up. Images refreshed."); return 20; } return n - 1; }), 1000);
        return () => clearInterval(iv);
    }, [passed]);

    const toggle = (i) => setSel(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);

    const verify = () => {
        if (sel.length !== cur.need) {
            setShake(true); setTimeout(() => setShake(false), 500);
            setAttempts(a => a + 1);
            const msgs = [`We needed exactly ${cur.need}. You picked ${sel.length}.`, "Incorrect. Our AI is mildly disappointed.", "Still wrong. Perhaps try with fewer assumptions.", "The correct answer exists. You haven't found it yet."];
            setMsg(msgs[Math.min(attempts, msgs.length - 1)]);
            setSel([]); setGrid(mkGrid()); setT(20); return;
        }
        setChecking(true);
        setTimeout(() => {
            setChecking(false);
            if (round + 1 >= ROUNDS.length) { setPassed(true); setTimeout(onPass, 900); }
            else { setRound(r => r + 1); setSel([]); setGrid(mkGrid()); setMsg(null); setT(20); }
        }, 1800);
    };

    if (passed) return (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                <CheckCircle2 size={48} style={{ color: "#2d9e6a", margin: "0 auto 1rem" }} />
                <p style={{ fontFamily: "Georgia,serif", fontSize: "1.1rem" }}>Humanity confirmed. Probably.</p>
            </motion.div>
        </div>
    );
    if (checking) return (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}><Loader2 size={32} style={{ color: "#e63946" }} /></motion.div>
            <p style={{ marginTop: "1rem", fontStyle: "italic", color: "#888", fontSize: "0.85rem" }}>Verifying your humanity…</p>
        </div>
    );

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <p style={{ fontSize: "0.7rem", color: "#aaa" }}>Round {round + 1} of {ROUNDS.length}</p>
                <span style={{ fontSize: "0.7rem", color: t < 6 ? "#e63946" : "#bbb" }}>{t}s</span>
            </div>
            <div style={{ height: 2, background: "#f0ecea", borderRadius: 2, overflow: "hidden", marginBottom: "0.9rem" }}>
                <motion.div key={t + "r" + round} animate={{ width: `${(t / 20) * 100}%` }} transition={{ duration: 0.9, ease: "linear" }}
                    style={{ height: "100%", background: t < 6 ? "#e63946" : "#1a1a1a", borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: "0.83rem", color: "#333", marginBottom: "0.35rem", fontFamily: "Georgia,serif" }}>{cur.prompt}</p>
            <p style={{ fontSize: "0.7rem", color: "#aaa", marginBottom: "0.9rem", fontStyle: "italic" }}>Select exactly {cur.need} square{cur.need !== 1 ? "s" : ""}.</p>
            <motion.div animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginBottom: "1rem" }}>
                    {grid.map((color, i) => (
                        <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => toggle(i)}
                            style={{ height: 70, borderRadius: 10, background: color, border: sel.includes(i) ? "3px solid #e63946" : "3px solid transparent", cursor: "pointer", position: "relative", overflow: "hidden", transition: "border-color 0.12s" }}>
                            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(255,255,255,0.03) 5px,rgba(255,255,255,0.03) 6px)", pointerEvents: "none" }} />
                            {sel.includes(i) && <div style={{ position: "absolute", inset: 0, background: "rgba(230,57,70,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={20} style={{ color: "white" }} /></div>}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
            <button onClick={verify} style={{ ...primaryBtnStyle, width: "100%" }}>Verify ({sel.length}/{cur.need} selected)</button>
            {msg && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: "0.65rem", fontSize: "0.76rem", color: "#b0272c", fontStyle: "italic", textAlign: "center" }}>{msg}{attempts > 0 ? ` (${attempts + 1} attempts)` : ""}</motion.p>}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   STEP 6 — LOADING
══════════════════════════════════════════════════════════════ */
const StepLoading = ({ onComplete }) => {
    const [phase, setPhase] = useState(0);
    const phases = [{ label: "Contacting the kitchen…", ms: 2200 }, { label: "Checking table availability…", ms: 2600 }, { label: "Almost confirmed…", ms: 2000 }, { label: "One final verification…", ms: 2400 }, { label: "Finalising your reservation…", ms: 1800 }];
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
                <motion.p key={phase} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", color: "#1a1a1a", marginBottom: "0.5rem" }}>
                    {phase < phases.length ? phases[phase].label : "Done."}
                </motion.p>
            </AnimatePresence>
            <div style={{ height: 4, background: "#f0ecea", borderRadius: 2, overflow: "hidden", maxWidth: 260, margin: "0.9rem auto 0.4rem" }}>
                <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.55, ease: "easeOut" }} style={{ height: "100%", background: "#e63946", borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: "0.7rem", color: "#aaa" }}>{pct}%</p>
            {phase === 3 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: "1rem", fontSize: "0.74rem", color: "#bbb", fontStyle: "italic" }}>Your patience is our secret ingredient.</motion.p>}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   CLOSE GUARD — Snake game then navigate home
══════════════════════════════════════════════════════════════ */
const CloseGuard = ({ onForceClose }) => (
    <div style={overlayStyle}>
        <motion.div initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ ...modalStyle, padding: "2rem", maxWidth: 460, textAlign: "center" }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", margin: "0 0 0.4rem", color: "#1a1a1a" }}>
                You want to leave?
            </h3>
            <p style={{ color: "#888", fontSize: "0.8rem", fontStyle: "italic", marginBottom: "1.5rem" }}>
                Prove it. Collect 2 items to unlock the exit.
            </p>
            <SnakeGame onComplete={onForceClose} />
        </motion.div>
    </div>
);

/* ══════════════════════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════════════════════ */
const navBtnStyle = { background: "white", border: "1px solid #e8e2e2", borderRadius: 8, padding: "4px 7px", cursor: "pointer", display: "flex", alignItems: "center" };
const labelStyle = { display: "block", fontSize: "0.76rem", fontWeight: 500, color: "#555", marginBottom: "0.35rem" };
const appendBase = { width: "100%", background: "white", border: "1px solid #e8e2e2", borderRadius: 12, padding: "0.62rem 0.9rem", fontSize: "0.88rem", color: "#1a1a1a", outline: "none", fontFamily: "inherit", boxSizing: "border-box", position: "relative", zIndex: 1 };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(15,10,10,0.62)", backdropFilter: "blur(5px)", zIndex: 9999900, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "'Nunito',-apple-system,sans-serif" };
const modalStyle = { background: "#f5f1f1", borderRadius: 24, padding: "2rem", width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.22)", position: "relative" };
const primaryBtnStyle = { background: "#e63946", color: "white", border: "none", borderRadius: 100, padding: "0.7rem 1.75rem", fontSize: "0.86rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(230,57,70,0.22)" };

/* ══════════════════════════════════════════════════════════════
   STEPS CONFIG
══════════════════════════════════════════════════════════════ */
const STEPS = [
    { title: "Pick a Date", subtitle: "Availability is a living document." },
    { title: "Select a Time", subtitle: "Speed is strongly recommended." },
    { title: "How Many Guests?", subtitle: "We reserve the right to recount." },
    { title: "Your Details", subtitle: "We need to know who to blame." },
    { title: "Prove You're Human", subtitle: "Our system has concerns." },
    { title: "Confirming…", subtitle: "This will take exactly as long as it takes." },
];

const POPUPS = [
    "Our system just restarted. Your progress is safe. (Probably.)",
    "A staff member reviewed your booking. They have questions.",
    "73% of people abandon at this step. You're still here. Interesting.",
    "We updated our Privacy Policy. Nothing changed. Just wanted to mention it.",
    "Your session was about to expire. We extended it. You're welcome.",
    "The chef just walked past your table assignment. He seemed conflicted.",
    "Fun fact: the average booking takes 4 minutes. You're at minute 7.",
];

/* ══════════════════════════════════════════════════════════════
   MAIN WIZARD
══════════════════════════════════════════════════════════════ */
const BookTableWizard = ({ onClose }) => {
    const [step, setStep] = useState(0);
    const [done, setDone] = useState(false);
    const [showCloseGuard, setShowCloseGuard] = useState(false);
    const [captchaPassed, setCaptchaPassed] = useState(false);
    const [showTsunami, setShowTsunami] = useState(false);
    const [tsunamiKey, setTsunamiKey] = useState(0);
    const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
    const [missCount, setMissCount] = useState(0);
    const [popup, setPopup] = useState(null);
    const [timerPopup, setTimerPopup] = useState(false);
    const popupRef = useRef(null);
    const timerRef = useRef(null);
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

    // Acknowledged popup — every 45s, not too frequent
    useEffect(() => {
        const iv = setInterval(() => {
            if (step < 5 && !popup) {
                setPopup(POPUPS[Math.floor(Math.random() * POPUPS.length)]);
            }
        }, 45000);
        return () => clearInterval(iv);
    }, [step, popup]);

    // Timer popup — every 20s, centred over the form
    useEffect(() => {
        const iv = setInterval(() => {
            if (step < 5 && !timerPopup) setTimerPopup(true);
        }, 20000);
        return () => clearInterval(iv);
    }, [step, timerPopup]);

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

    // Close guard: show snake → then navigate to home (call onClose which navigates)
    const handleClose = () => setShowCloseGuard(true);
    const handleForceClose = () => { setShowCloseGuard(false); onClose(); };

    if (showCloseGuard) return (
        <CloseGuard onForceClose={handleForceClose} />
    );

    if (done) return (
        <>
            <RageCursor />
            <div style={overlayStyle}>
                <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{ ...modalStyle, textAlign: "center", padding: "3rem 2rem" }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                        <Utensils size={48} style={{ color: "#e63946", margin: "0 auto 1.5rem" }} />
                    </motion.div>
                    <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#1a1a1a", margin: "0 0 0.75rem" }}>Table Reserved.</h2>
                    <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "0.5rem" }}>
                        Table for <strong>{guests}</strong> on <strong>{date}</strong> at <strong>{time}</strong>.
                    </p>
                    <p style={{ color: "#bbb", fontSize: "0.76rem", fontStyle: "italic", marginBottom: "2rem" }}>
                        A confirmation email will arrive somewhere between now and never.
                    </p>
                    <button onClick={onClose} style={primaryBtnStyle}>Close</button>
                </motion.div>
            </div>
            <style>{`* { cursor: none !important; }`}</style>
        </>
    );

    return (
        <>
            <RageCursor />

            {/* Tsunami */}
            <AnimatePresence>
                {showTsunami && <TsunamiWave key={tsunamiKey} onComplete={() => setShowTsunami(false)} />}
            </AnimatePresence>

            {/* Large random popup — must dismiss */}
            <AnimatePresence>
                {popup && <AnnoyPopup key={popup} msg={popup} onDismiss={() => setPopup(null)} />}
            </AnimatePresence>

            {/* Timer popup */}
            <AnimatePresence>
                {timerPopup && <TimerPopup key={Date.now()} onClose={() => setTimerPopup(false)} />}
            </AnimatePresence>

            {/* Main modal */}
            <div style={overlayStyle}>
                <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 28 }} style={modalStyle}>

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.4rem" }}>
                        <div>
                            <p style={{ fontSize: "0.7rem", color: "#e63946", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
                                Step {step + 1} of {STEPS.length}
                            </p>
                            <h2 style={{ fontFamily: "Georgia,serif", fontSize: "1.55rem", color: "#1a1a1a", margin: 0, lineHeight: 1.1 }}>{STEPS[step].title}</h2>
                            <p style={{ color: "#aaa", fontSize: "0.76rem", margin: "5px 0 0", fontStyle: "italic" }}>{STEPS[step].subtitle}</p>
                        </div>
                        <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: 4, marginTop: 3 }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress */}
                    <div style={{ height: 2, background: "#f0ecea", borderRadius: 2, marginBottom: "1.6rem", overflow: "hidden" }}>
                        <motion.div animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.4, ease: "easeOut" }}
                            style={{ height: "100%", background: "#e63946", borderRadius: 2 }} />
                    </div>

                    {/* Content */}
                    <div style={{ minHeight: 290 }}>
                        <AnimatePresence mode="wait">
                            <motion.div key={step} initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.19 }}>
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
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.4rem", position: "relative" }}>
                            <button onClick={() => { setBtnOffset({ x: 0, y: 0 }); setStep(s => Math.max(0, s - 1)); }} disabled={step === 0}
                                style={{ background: "none", border: "1px solid #e8e2e2", borderRadius: 100, padding: "0.62rem 1.2rem", fontSize: "0.83rem", color: step === 0 ? "#ddd" : "#555", cursor: step === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit" }}>
                                <ChevronLeft size={13} /> Back
                            </button>
                            <motion.button ref={btnRef} animate={{ x: btnOffset.x, y: btnOffset.y }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                onMouseEnter={handleNextHover} onClick={handleNext}
                                style={{ ...primaryBtnStyle, display: "flex", alignItems: "center", gap: 5, opacity: canProceed() ? 1 : 0.82 }}>
                                {canProceed() ? "Continue" : "Not yet"}
                                <ChevronRight size={13} />
                            </motion.button>
                        </div>
                    )}
                    {missCount > 2 && (
                        <p style={{ textAlign: "right", fontSize: "0.66rem", color: "#ddd", marginTop: 5, fontStyle: "italic" }}>
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