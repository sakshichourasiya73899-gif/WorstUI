import { useState, useEffect } from "react";

// Confusing CAPTCHA challenges
const CHALLENGES = [
    {
        question: "Select all images that are NOT a cat (but could be)",
        images: [
            { emoji: "🐱", label: "cat", correct: false },   // IS a cat, so DON'T select
            { emoji: "🦁", label: "lion", correct: true },    // could be a cat? sure
            { emoji: "🐶", label: "dog", correct: false },    // no
            { emoji: "🐯", label: "tiger", correct: true },   // big cat
            { emoji: "🦊", label: "fox", correct: false },    // no
            { emoji: "🐾", label: "paws", correct: true },    // paws could be cat
        ],
        instruction: "Click all that are NOT a cat (but could be a cat if they tried harder)",
    },
    {
        question: "Which of these is the LEAST like a pizza?",
        images: [
            { emoji: "🍕", label: "pizza", correct: false },
            { emoji: "🫓", label: "flatbread", correct: false },
            { emoji: "🎡", label: "ferris wheel", correct: true },
            { emoji: "🍩", label: "donut", correct: false },
            { emoji: "🌍", label: "globe", correct: false },
            { emoji: "🥏", label: "frisbee", correct: false },
        ],
        instruction: "Select the one that is LEAST like pizza (trick: they're all circles)",
    },
    {
        question: "Identify the traffic lights",
        images: [
            { emoji: "🚦", label: "traffic light", correct: true },
            { emoji: "🔴", label: "red circle", correct: false },
            { emoji: "🟡", label: "yellow circle", correct: false },
            { emoji: "🚥", label: "horizontal light", correct: false },  // intentionally wrong answer
            { emoji: "🔆", label: "brightness", correct: false },
            { emoji: "🪩", label: "disco ball", correct: false },
        ],
        instruction: "Select ONLY the traffic lights (horizontal ones don't count, we checked)",
    },
    {
        question: "Select all images containing water",
        images: [
            { emoji: "🌊", label: "wave", correct: true },
            { emoji: "💧", label: "droplet", correct: true },
            { emoji: "🧃", label: "juice box", correct: false },  // has liquid but not "water"
            { emoji: "🍵", label: "tea", correct: false },        // water-based but we say no
            { emoji: "🫧", label: "bubbles", correct: true },
            { emoji: "🌧️", label: "rain cloud", correct: false }, // clouds aren't water... or are they
        ],
        instruction: "Select all images with water (tea is not water, clouds are clouds, good luck)",
    },
];

export default function AnnoyingCaptcha({ onVerified }) {
    const [challenge] = useState(() => CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]);
    const [selected, setSelected] = useState([]);
    const [attempts, setAttempts] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [shuffled, setShuffled] = useState([]);
    const [spinIndex, setSpinIndex] = useState(null);

    useEffect(() => {
        // Shuffle images each time
        setShuffled([...challenge.images].sort(() => Math.random() - 0.5));
    }, [challenge]);

    const toggle = (i) => {
        setSpinIndex(i);
        setTimeout(() => setSpinIndex(null), 500);
        setSelected(prev =>
            prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
        );
    };

    const verify = () => {
        const correctIndexes = shuffled
            .map((img, i) => (img.correct ? i : null))
            .filter(i => i !== null);

        const isCorrect =
            selected.length === correctIndexes.length &&
            correctIndexes.every(i => selected.includes(i));

        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (isCorrect) {
            setFeedback({ type: "success", msg: "Fine. You passed. We're still suspicious." });
            setTimeout(() => onVerified(), 1200);
        } else {
            const msgs = [
                "Wrong. Also we reshuffled the images. Try again.",
                "Nope. Have you considered that you might not be human?",
                "Incorrect. The images have rotated 90° as punishment.",
                "Still wrong. We've alerted the authorities.",
                "You've failed " + newAttempts + " times. Impressive.",
                "Are you a robot? A confused robot? Both?",
            ];
            setFeedback({ type: "error", msg: msgs[Math.min(newAttempts - 1, msgs.length - 1)] });
            // Re-shuffle on failure
            setShuffled(prev => [...prev].sort(() => Math.random() - 0.5));
            setSelected([]);
        }
    };

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Nunito', sans-serif"
        }}>
            <div style={{
                background: "white", borderRadius: 24, padding: "2rem",
                maxWidth: 420, width: "92%", boxShadow: "0 30px 80px rgba(0,0,0,0.4)"
            }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: "1.5rem" }}>🤖</span>
                    <div>
                        <p style={{ fontWeight: 800, fontSize: "0.95rem", margin: 0 }}>Security Verification™</p>
                        <p style={{ color: "#aaa", fontSize: "0.72rem", margin: 0 }}>Proving you're human (probably)</p>
                    </div>
                    <div style={{ marginLeft: "auto", background: "#fff3f3", borderRadius: 8, padding: "3px 8px", fontSize: "0.7rem", color: "#e63946", fontWeight: 700 }}>
                        ATTEMPT #{attempts + 1}
                    </div>
                </div>

                <div style={{ height: 1, background: "#f0ece8", margin: "12px 0" }} />

                <p style={{ fontSize: "0.8rem", color: "#e63946", fontWeight: 700, margin: "0 0 4px" }}>
                    {challenge.question}
                </p>
                <p style={{ fontSize: "0.72rem", color: "#aaa", fontStyle: "italic", margin: "0 0 14px" }}>
                    {challenge.instruction}
                </p>

                {/* Image grid */}
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16
                }}>
                    {shuffled.map((img, i) => {
                        const isSel = selected.includes(i);
                        const isSpinning = spinIndex === i;
                        return (
                            <div
                                key={i}
                                onClick={() => toggle(i)}
                                style={{
                                    border: `3px solid ${isSel ? "#e63946" : "#e8e4e0"}`,
                                    borderRadius: 14,
                                    padding: "18px 10px",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    background: isSel ? "#fff0f1" : "#faf8f6",
                                    transition: "all 0.2s",
                                    transform: isSpinning ? "rotate(360deg) scale(1.1)" : attempts % 2 === 1 ? `rotate(${(i * 37) % 8 - 4}deg)` : "none",
                                    userSelect: "none",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <span style={{ fontSize: "2.2rem", display: "block", lineHeight: 1.1 }}>{img.emoji}</span>
                                <span style={{
                                    fontSize: "0.62rem", color: isSel ? "#e63946" : "#ccc",
                                    display: "block", marginTop: 6, fontWeight: 600
                                }}>
                                    {isSel ? "✓ selected" : img.label}
                                </span>
                                {isSel && (
                                    <div style={{
                                        position: "absolute", top: 4, right: 4, width: 16, height: 16,
                                        background: "#e63946", borderRadius: "50%", display: "flex",
                                        alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "white"
                                    }}>✓</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Feedback */}
                {feedback && (
                    <div style={{
                        padding: "10px 14px", borderRadius: 10, marginBottom: 12,
                        background: feedback.type === "success" ? "#f0fff4" : "#fff0f1",
                        border: `1px solid ${feedback.type === "success" ? "#b2f5c8" : "#ffd6d6"}`,
                        fontSize: "0.78rem", color: feedback.type === "success" ? "#2ecc71" : "#e63946",
                        fontWeight: 600
                    }}>
                        {feedback.type === "success" ? "✅" : "❌"} {feedback.msg}
                    </div>
                )}

                {/* Verify button - also moves a little */}
                <button
                    onClick={verify}
                    style={{
                        width: "100%", background: "#e63946", color: "white", border: "none",
                        borderRadius: 100, padding: "0.85rem", fontSize: "0.9rem", fontWeight: 800,
                        cursor: "pointer", fontFamily: "inherit",
                        transform: attempts > 2 ? `translateX(${Math.sin(attempts) * 15}px)` : "none",
                        transition: "transform 0.3s"
                    }}
                >
                    {attempts === 0 ? "Verify I'm Human" : attempts < 3 ? "Try Again (You Can Do This)" : "Please Just Pass Me"}
                </button>

                <p style={{ textAlign: "center", fontSize: "0.65rem", color: "#ddd", marginTop: 10, fontStyle: "italic" }}>
                    Protected by reCAPTCHA Knock-Off™ · Privacy · Terms · 🍕
                </p>
            </div>
        </div>
    );
}