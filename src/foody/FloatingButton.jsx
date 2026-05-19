import { useState, useEffect, useRef, useCallback } from "react";
import { Hand, UserCheck } from "lucide-react";

const WALL_PADDING = 20;

export default function FloatingButton({ label, onClick, containerRef }) {
    const btnRef = useRef(null);
    const posRef = useRef({ x: null, y: null });
    const corneredRef = useRef(false);
    const cornerTouchesRef = useRef(0);
    const [pos, setPos] = useState({ x: null, y: null });
    const [cornered, setCornered] = useState(false);
    const [message, setMessage] = useState(null);
    const [hasStartedRunning, setHasStartedRunning] = useState(false);

    const CORNER_MESSAGES = [
        "Fine. You caught me.",
        "Ugh. Okay.",
        "I can't run anymore.",
        "...please be gentle.",
        "You win. This time.",
    ];

    const getContainerBounds = useCallback(() => {
        const el = containerRef?.current || document.body;
        const rect = el.getBoundingClientRect();
        return {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
        };
    }, [containerRef]);

    const handleMouseEnter = () => {
        if (!hasStartedRunning && !cornered) {
            const rect = btnRef.current.getBoundingClientRect();
            posRef.current = { x: rect.left, y: rect.top };
            setPos({ x: rect.left, y: rect.top });
            setHasStartedRunning(true);
        }
    };

    // Magnetic Repulsion synced perfectly to cursor proximity and approach vector
    useEffect(() => {
        if (cornered || !hasStartedRunning) return;

        const handleMouseMove = (e) => {
            if (posRef.current.x === null) return;
            const btnW = 180, btnH = 48;

            // Button center
            const cx = posRef.current.x + btnW / 2;
            const cy = posRef.current.y + btnH / 2;

            // Push vector
            const dx = cx - e.clientX;
            const dy = cy - e.clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // High proximity repulsion boundary: 180px
            if (dist < 180) {
                const angle = Math.atan2(dy, dx);

                // Exponential repulsion force: pushes stronger as cursor gets closer
                let force = (180 - dist) * 0.48;
                if (dist < 50) {
                    force *= 1.8; // Turbo boost if mouse is extremely close!
                }

                // Increase escape speed based on previous corner touches!
                const multiplier = 1 + (cornerTouchesRef.current * 0.35);
                let nextX = posRef.current.x + Math.cos(angle) * force * multiplier;
                let nextY = posRef.current.y + Math.sin(angle) * force * multiplier;

                const bounds = getContainerBounds();
                const minX = bounds.left + WALL_PADDING;
                const maxX = bounds.left + bounds.width - btnW - WALL_PADDING;
                const minY = bounds.top + WALL_PADDING;
                const maxY = bounds.top + bounds.height - btnH - WALL_PADDING;

                // Enforce margins
                if (nextX <= minX) nextX = minX;
                if (nextX >= maxX) nextX = maxX;
                if (nextY <= minY) nextY = minY;
                if (nextY >= maxY) nextY = maxY;

                // Detect corner touches
                const inCornerX = (nextX <= minX + 5 || nextX >= maxX - 5);
                const inCornerY = (nextY <= minY + 5 || nextY >= maxY - 5);

                if (inCornerX && inCornerY) {
                    if (cornerTouchesRef.current < 2) {
                        // Bounce to center/random spot to keep the game going!
                        cornerTouchesRef.current += 1;
                        const rx = bounds.left + WALL_PADDING + Math.random() * (bounds.width - btnW - 2 * WALL_PADDING);
                        const ry = bounds.top + WALL_PADDING + Math.random() * (bounds.height - btnH - 2 * WALL_PADDING);
                        nextX = rx;
                        nextY = ry;

                        setMessage(cornerTouchesRef.current === 1
                            ? "⚡ Nice try! Speeding up! 🏃"
                            : "🔥 Almost! Catch me one more time! 🏃‍♂️"
                        );
                        setTimeout(() => setMessage(null), 1500);
                    } else {
                        // Finally lock in the 3rd corner touch!
                        corneredRef.current = true;
                        setCornered(true);
                        setMessage(CORNER_MESSAGES[Math.floor(Math.random() * CORNER_MESSAGES.length)]);
                    }
                }

                posRef.current = { x: nextX, y: nextY };
                setPos({ x: nextX, y: nextY });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [cornered, hasStartedRunning, getContainerBounds]);

    const handleClick = (e) => {
        if (!cornered) {
            e.preventDefault();
            const bounds = getContainerBounds();
            const btnW = 180, btnH = 48;

            const rx = bounds.left + WALL_PADDING + Math.random() * (bounds.width - btnW - 2 * WALL_PADDING);
            const ry = bounds.top + WALL_PADDING + Math.random() * (bounds.height - btnH - 2 * WALL_PADDING);

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
                    background: "#fff", border: "2px solid #e63946", borderRadius: 100,
                    padding: "5px 16px", fontSize: "0.74rem", color: "#e63946",
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
                    width: 180,
                    height: 48,
                    background: cornered ? "#e63946" : "linear-gradient(135deg, #e63946, #c1121f)", // Beautiful brand red colors
                    color: "white",
                    border: "none",
                    borderRadius: 100, // Fully rounded matching input fields!
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: cornered ? "pointer" : "default",
                    fontFamily: "'Nunito', sans-serif",
                    boxShadow: "0 6px 18px rgba(230,57,70,0.25)",
                    transition: "background 0.3s, box-shadow 0.3s, transform 0.2s",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    {cornered ? <Hand size={15} /> : <UserCheck size={15} />}
                    {label}
                </span>
            </button>
            <style>{`@keyframes fadeInMsg { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }`}</style>
        </div>
    );
}