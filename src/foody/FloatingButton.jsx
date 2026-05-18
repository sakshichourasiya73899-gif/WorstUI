import { useState, useEffect, useRef, useCallback } from "react";

const WALL_PADDING = 20;

export default function FloatingButton({ label, onClick, containerRef }) {
    const btnRef = useRef(null);
    const posRef = useRef({ x: null, y: null });
    const velRef = useRef({ vx: 2.5, vy: 1.8 });
    const corneredRef = useRef(false);
    const frameRef = useRef(null);
    const [pos, setPos] = useState({ x: null, y: null });
    const [cornered, setCornered] = useState(false);
    const [message, setMessage] = useState(null);

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

    // Initialise position
    useEffect(() => {
        const bounds = getContainerBounds();
        const btnW = 180, btnH = 52;
        const startX = bounds.left + (bounds.width - btnW) / 2;
        const startY = bounds.top + bounds.height - 100;
        posRef.current = { x: startX, y: startY };
        setPos({ x: startX, y: startY });
    }, [getContainerBounds]);

    // Bounce animation when NOT cornered
    useEffect(() => {
        if (cornered) {
            cancelAnimationFrame(frameRef.current);
            return;
        }

        const btnW = 180, btnH = 52;

        const animate = () => {
            const bounds = getContainerBounds();
            const minX = bounds.left + WALL_PADDING;
            const maxX = bounds.left + bounds.width - btnW - WALL_PADDING;
            const minY = bounds.top + WALL_PADDING;
            const maxY = bounds.top + bounds.height - btnH - WALL_PADDING;

            let { x, y } = posRef.current;
            let { vx, vy } = velRef.current;

            x += vx;
            y += vy;

            let nowCornered = false;

            // Wall collisions
            if (x <= minX) { x = minX; vx = Math.abs(vx); }
            if (x >= maxX) { x = maxX; vx = -Math.abs(vx); }
            if (y <= minY) { y = minY; vy = Math.abs(vy); }
            if (y >= maxY) { y = maxY; vy = -Math.abs(vy); }

            // Corner detection
            const inCornerX = (x <= minX + 5 || x >= maxX - 5);
            const inCornerY = (y <= minY + 5 || y >= maxY - 5);
            if (inCornerX && inCornerY) {
                nowCornered = true;
                corneredRef.current = true;
                setCornered(true);
                setMessage(CORNER_MESSAGES[Math.floor(Math.random() * CORNER_MESSAGES.length)]);
            }

            posRef.current = { x, y };
            velRef.current = { vx, vy };
            setPos({ x, y });

            if (!nowCornered) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [cornered, getContainerBounds]);

    // Mouse proximity — run away faster
    useEffect(() => {
        if (cornered) return;
        const handleMouseMove = (e) => {
            const btnW = 180, btnH = 52;
            const cx = posRef.current.x + btnW / 2;
            const cy = posRef.current.y + btnH / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
                // Flee! Speed up away from cursor
                const flee = 6 / dist;
                velRef.current = {
                    vx: velRef.current.vx - dx * flee,
                    vy: velRef.current.vy - dy * flee,
                };
                // Cap speed
                const speed = Math.sqrt(velRef.current.vx ** 2 + velRef.current.vy ** 2);
                if (speed > 9) {
                    velRef.current.vx = (velRef.current.vx / speed) * 9;
                    velRef.current.vy = (velRef.current.vy / speed) * 9;
                }
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [cornered]);

    const handleClick = () => {
        if (!cornered) {
            // Bounce harder, tease
            velRef.current = { vx: -6, vy: -5 };
            return;
        }
        onClick();
    };

    if (pos.x === null) return null;

    return (
        <div
            ref={btnRef}
            style={{
                position: "fixed",
                left: pos.x,
                top: pos.y,
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
                    width: 180,
                    background: cornered ? "#e63946" : "#ff6b6b",
                    color: "white",
                    border: "none",
                    borderRadius: 100,
                    padding: "0.85rem 2rem",
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    cursor: cornered ? "pointer" : "not-allowed",
                    fontFamily: "'Nunito', sans-serif",
                    boxShadow: cornered
                        ? "0 8px 30px rgba(230,57,70,0.45)"
                        : "0 4px 20px rgba(255,107,107,0.4)",
                    transition: "background 0.3s, box-shadow 0.3s",
                    whiteSpace: "nowrap",
                }}
            >
                {cornered ? "✋ " + label : "🏃 " + label}
            </button>
            <style>{`@keyframes fadeInMsg { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }`}</style>
        </div>
    );
}