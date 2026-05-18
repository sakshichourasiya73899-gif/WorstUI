import { useState } from "react";
import { motion } from "framer-motion";

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [stage, setStage] = useState("idle");
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [sendClicks, setSendClicks] = useState(0);
    const [bottomOffset, setBottomOffset] = useState(24);
    const [queueMsg, setQueueMsg] = useState("Please wait, there are 442 people in line.");
    const [btnLabel, setBtnLabel] = useState("Send");
    const [sinking, setSinking] = useState(false);

    const funnyQueueMessages = [
        "Please wait, there are 442 people in line.",
        "Still waiting... 441 people ahead of you.",
        "Someone just joined. Now 500 people in line 😭",
        "Our agent is on a lunch break. Back in 3 hours.",
        "You've been disconnected. Please start over.",
        "Error 404: Help not found.",
        "Your message is very important to us 😂",
        "Have you tried turning it off and on again?",
        "We have forwarded your request to nobody.",
        "Thank you for your patience! (We don't mean it) 🙃",
    ];

    const handleHelp = () => {
        setStage("queue");
        let idx = 0;
        const interval = setInterval(() => {
            idx++;
            if (idx >= funnyQueueMessages.length) {
                clearInterval(interval);
                return;
            }
            setQueueMsg(funnyQueueMessages[idx]);
        }, 5000);
    };

    const sendRunAway = () => {
        if (sendClicks >= 5) return;
        const x = (Math.random() - 0.5) * 180;
        const y = (Math.random() - 0.5) * 80;
        setPosition({ x, y });

        // Change button label to taunt
        const taunts = ["Nope 😈", "Catch me!", "Too slow!", "Hehe~", "Nah 😂"];
        setBtnLabel(taunts[Math.floor(Math.random() * taunts.length)]);
        setTimeout(() => setBtnLabel("Send"), 800);
    };

    const handleSend = () => {
        setSendClicks((c) => {
            const next = c + 1;
            if (next >= 5) {
                setStage("sent");
                setMessage("");
                setPosition({ x: 0, y: 0 });
            }
            return next;
        });
    };

    // Widget slowly sinks down when "Send to bottom" is clicked
    const handleSendToBottom = () => {
        setSinking(true);
        // Gradually reduce bottomOffset over time
        let current = bottomOffset;
        const interval = setInterval(() => {
            current -= 2;
            setBottomOffset(current);
            if (current <= -320) {
                clearInterval(interval);
                setOpen(false);
                // After fully sunk, pop back up after 4 seconds with a taunt
                setTimeout(() => {
                    setBottomOffset(24);
                    setOpen(true);
                    setSinking(false);
                    setStage("queue");
                    setQueueMsg("Miss me? 😈 I'm back!");
                }, 4000);
            }
        }, 30); // runs every 30ms — very slow visible sink
    };

    return (
        <motion.div
            className="fixed z-40"
            animate={{ bottom: `${bottomOffset}px` }}
            transition={{ duration: 0.03, ease: "linear" }}
            style={{ right: "24px" }}
        >
            {/* Chat bubble — pulsing to grab attention */}
            {!open && (
                <motion.button
                    animate={{
                        scale: [1, 1.15, 1],
                        boxShadow: [
                            "0 0 0 0 rgba(230,57,70,0)",
                            "0 0 0 12px rgba(230,57,70,0.3)",
                            "0 0 0 0 rgba(230,57,70,0)",
                        ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    onClick={() => {
                        setOpen(true);
                        setStage("idle");
                    }}
                    className="w-16 h-16 rounded-full bg-[#e63946] text-white flex flex-col items-center justify-center shadow-xl"
                >
                    <span className="text-2xl">🆘</span>
                    <span className="text-[9px] font-bold leading-none mt-0.5">HELP</span>
                </motion.button>
            )}

            {/* Chat box */}
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-[300px] rounded-2xl shadow-2xl overflow-hidden"
                    style={{ background: "#1a1a2e" }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🆘</span>
                            <p className="text-white font-bold text-base">How can we help?</p>
                        </div>
                        <button
                            onClick={() => {
                                setOpen(false);
                                setBottomOffset(24);
                                setStage("idle");
                                setMessage("");
                                setSendClicks(0);
                                setPosition({ x: 0, y: 0 });
                                setSinking(false);
                            }}
                            className="w-7 h-7 rounded-md bg-blue-500 text-white flex items-center justify-center text-sm hover:bg-blue-400 transition"
                        >
                            ∧
                        </button>
                    </div>

                    {/* Body */}
                    <div className="bg-white px-4 py-4 flex flex-col gap-3">

                        {/* Queue message */}
                        {stage === "queue" && (
                            <motion.p
                                key={queueMsg}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm text-neutral-700 font-medium"
                            >
                                {queueMsg}
                            </motion.p>
                        )}

                        {/* Sent confirmation */}
                        {stage === "sent" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-neutral-700 space-y-1"
                            >
                                <p>✅ Message sent!</p>
                                <p className="text-xs text-neutral-400">
                                    Expected response time: 6–8 business years 😂
                                </p>
                                <p className="text-xs text-neutral-400">
                                    Ticket #000001 — Priority: Whenever 🙃
                                </p>
                            </motion.div>
                        )}

                        {/* Textarea */}
                        {stage !== "sent" && (
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={
                                    sendClicks === 0
                                        ? "Type your message..."
                                        : sendClicks < 3
                                            ? "Still typing? Bold of you 😂"
                                            : "Give up yet? 😈"
                                }
                                rows={3}
                                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-blue-300"
                            />
                        )}

                        {/* Footer */}
                        {stage !== "sent" && (
                            <div
                                className="flex items-center justify-between relative"
                                style={{ minHeight: "48px" }}
                            >
                                {/* Help button */}
                                <button
                                    onClick={handleHelp}
                                    className="text-sm text-blue-500 font-medium hover:underline"
                                >
                                    Help
                                </button>

                                {/* Send button zone */}
                                <div
                                    className="relative"
                                    style={{ width: "160px", height: "48px" }}
                                >
                                    <motion.button
                                        animate={{ x: position.x, y: position.y }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        onMouseEnter={sendRunAway}
                                        onClick={handleSend}
                                        className="absolute right-0 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold px-4 py-2 rounded-lg flex flex-col items-center leading-tight"
                                        style={{
                                            cursor: sendClicks >= 5 ? "pointer" : "crosshair",
                                            minWidth: "80px",
                                        }}
                                    >
                                        <span>{sendClicks >= 5 ? "Send 😇" : btnLabel}</span>
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {/* Send to bottom — separate row, always visible */}
                        {stage !== "sent" && (
                            <button
                                onClick={handleSendToBottom}
                                disabled={sinking}
                                className="w-full text-center text-[11px] text-neutral-400 hover:text-red-400 transition border-t border-neutral-100 pt-2"
                            >
                                {sinking ? "Sinking... 🫠" : "⬇ Send to bottom"}
                            </button>
                        )}

                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ChatWidget;