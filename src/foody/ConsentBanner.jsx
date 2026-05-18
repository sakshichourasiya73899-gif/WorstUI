import { useState } from "react";
import { motion } from "framer-motion";

const CookieBanner = ({ onDismiss }) => {
    const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
    const [attempts, setAttempts] = useState(0);
    const [shake, setShake] = useState(false);
    const [yesSize, setYesSize] = useState(1);
    const [banners, setBanners] = useState([0]);
    const [dismissed, setDismissed] = useState(false);

    const runAway = () => {
        if (attempts >= 8) return;
        const x = (Math.random() - 0.5) * 220;
        const y = (Math.random() - 0.5) * 40;
        setBtnPos({ x, y });
        setAttempts((a) => {
            const next = a + 1;
            if (next % 3 === 0) {
                setShake(true);
                setTimeout(() => setShake(false), 600);
            }
            if (next === 4) setBanners((b) => [...b, 1]);
            if (next === 8) {
                setBanners((b) => [...b, 2]);
                setBtnPos({ x: 0, y: 0 });
            }
            return next;
        });
    };

    const handleNoClick = () => {
        if (attempts < 8) return;
        setDismissed(true);
        setTimeout(() => onDismiss(), 1400);
    };

    const messages = [
        "This site uses cookies, is that a problem for you?",
        "Seriously though... cookies? 🍪",
        "We REALLY need you to accept these cookies 😤",
    ];

    return (
        <>
            {banners.map((b, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 120, opacity: 0 }}
                    animate={
                        dismissed
                            ? { y: 120, opacity: 0 }
                            : { y: shake ? [0, -10, 10, -8, 8, -4, 4, 0] : 0, opacity: 1 }
                    }
                    transition={
                        dismissed
                            ? { duration: 1.3, ease: "easeInOut", delay: i * 0.18 }
                            : { y: { duration: 0.5 }, opacity: { duration: 0.5, delay: i * 0.12 } }
                    }
                    className="fixed left-0 right-0 z-50"
                    style={{
                        bottom: `${i * 84}px`,
                        background: i === 1 ? "#1a1a2e" : "#e63946",
                    }}
                >
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
                        <p className="text-white text-sm md:text-base font-medium flex-1">
                            {messages[Math.min(i, messages.length - 1)]}
                            {attempts > 0 && i === 0 && (
                                <span className="ml-2 text-white/50 text-xs">
                                    ({attempts} failed attempt{attempts > 1 ? "s" : ""} 😂)
                                </span>
                            )}
                        </p>

                        <div className="flex items-center gap-8 shrink-0">
                            <div
                                className="relative flex items-center justify-center"
                                style={{ width: "260px", height: "60px", overflow: "hidden" }}
                            >
                                <motion.button
                                    animate={{ x: btnPos.x, y: btnPos.y }}
                                    transition={{ type: "spring", stiffness: 380, damping: 22 }}
                                    onMouseEnter={runAway}
                                    onTouchStart={runAway}
                                    onClick={handleNoClick}
                                    className="absolute whitespace-nowrap text-white text-sm font-medium"
                                    style={{
                                        cursor: attempts >= 8 ? "pointer" : "crosshair",
                                        opacity: attempts >= 8 ? 1 : 0.9,
                                        textDecoration: attempts >= 8 ? "underline" : "none",
                                    }}
                                    title={
                                        attempts < 3
                                            ? "Try to catch me 😈"
                                            : attempts < 6
                                                ? "Getting tired? 😂"
                                                : attempts < 8
                                                    ? `${8 - attempts} more hover${8 - attempts !== 1 ? "s" : ""}...`
                                                    : "Click me! 😇"
                                    }
                                >
                                    {attempts >= 8 ? "✓ Not really, no" : "Not really, no"}
                                </motion.button>
                            </div>

                            <motion.button
                                animate={{ scale: yesSize }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                onClick={() => {
                                    setShake(true);
                                    setTimeout(() => setShake(false), 600);
                                    setYesSize((s) => Math.min(s + 0.3, 2.5));
                                }}
                                className="bg-white text-[#e63946] font-bold px-6 py-2 rounded-sm hover:bg-neutral-100 transition whitespace-nowrap"
                                style={{
                                    fontSize: `${Math.min(yesSize * 13, 26)}px`,
                                    transformOrigin: "right center",
                                }}
                            >
                                Yes
                            </motion.button>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-blue-600" />
                </motion.div>
            ))}
        </>
    );
};

export default CookieBanner;