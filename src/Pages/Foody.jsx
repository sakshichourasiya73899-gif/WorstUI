import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, BadgePercent, CheckCircle2 } from "lucide-react";
import Navbar from "@/foody/Navbar";
import MenuCarousel from "@/foody/MenuCarousel";
import CookieBanner from "@/foody/ConsentBanner";
import ChatWidget from "@/foody/ChatWidget";
import { foods, heroBowl } from "@/foody/data";

/* ─── Main Component ──────────────────────────────────── */
const Foody = () => {
  const [showCookie, setShowCookie] = useState(true);
  const [showDeletedAlert, setShowDeletedAlert] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("showDeletedConfirmation") === "true") {
      setShowDeletedAlert(true);
      localStorage.removeItem("showDeletedConfirmation");
    }
  }, []);

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f5f1f1] font-sans text-neutral-900 overflow-x-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────── */}
      <section id="home" className="relative max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">

          {/* Left */}
          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight"
            >
              it's not just<br />Food, It's an<br />Experience.
            </motion.h1>

            <div className="flex items-center gap-3 mt-10">
              <button
                onClick={scrollToMenu}
                className="bg-[#e63946] hover:bg-[#d12d3a] text-white px-8 py-3.5 rounded-full text-sm font-medium shadow-md transition"
              >
                View Menu
              </button>
              <button className="bg-white hover:bg-neutral-50 text-neutral-900 px-8 py-3.5 rounded-full text-sm font-medium transition shadow-sm">
                Book A Table
              </button>
            </div>

            <div className="mt-10">
              <p className="text-sm text-neutral-700 font-medium mb-3">Reviews</p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    "https://i.pravatar.cc/40?img=14",
                    "https://i.pravatar.cc/40?img=32",
                    "https://i.pravatar.cc/40?img=47",
                  ].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-[#f5f1f1] object-cover"
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-[10px] font-medium flex items-center justify-center border-2 border-[#f5f1f1]">
                    45+
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="w-[320px] h-[320px] md:w-[440px] md:h-[440px] rounded-full overflow-hidden shadow-2xl bg-white">
                <img
                  src={heroBowl}
                  alt="Signature pasta bowl"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating discount card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -left-4 md:-left-12 top-8 bg-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3"
              >
                <BadgePercent className="w-6 h-6 text-[#e63946]" />
                <div>
                  <p className="text-lg font-bold leading-none">5%</p>
                  <p className="text-[10px] text-[#e63946] font-semibold mt-1">
                    Discount{" "}
                    <span className="text-neutral-500 font-normal">for 2 orders</span>
                  </p>
                </div>
              </motion.div>

              {/* Floating leaves */}
              <motion.div
                animate={{ rotate: [0, 8, 0], y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -top-4 -right-2 text-4xl"
              >
                🌿
              </motion.div>
              <motion.div
                animate={{ rotate: [0, -10, 0], y: [0, 8, 0] }}
                transition={{ duration: 7, repeat: Infinity }}
                className="absolute bottom-6 -left-4 text-4xl"
              >
                🌿
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-2 right-8 text-3xl"
              >
                🍅
              </motion.div>
            </motion.div>
          </div>

        </div>

        {/* Floating decorative leaf */}
        <div className="absolute left-4 top-1/2 text-5xl opacity-80 pointer-events-none hidden md:block">
          🌿
        </div>
      </section>

      {/* ── MENU ─────────────────────────────────────── */}
      <section id="menu" className="max-w-7xl mx-auto">
        <MenuCarousel foods={foods} />
      </section>

      {/* ── ABOUT ────────────────────────────────────── */}
      <section id="about" className="max-w-5xl mx-auto px-6 md:px-12 py-20 text-center">
        <h2 className="font-serif text-3xl md:text-4xl">About Foody</h2>
        <p className="text-neutral-600 mt-6 max-w-2xl mx-auto leading-relaxed">
          We craft thoughtful, beautiful food experiences using the finest seasonal ingredients.
          Every dish is plated with care, every bite a quiet celebration.
        </p>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer id="contact" className="border-t border-neutral-200/60 mt-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <p className="font-serif italic text-xl text-neutral-900">
            F<span className="text-[#e63946]">oo</span>dy
          </p>
          <p>© 2026 Foody. All rights reserved.</p>
          <p>hello@foody.com</p>
        </div>
      </footer>

      {/* ── COOKIE BANNER ────────────────────────────── */}
      <AnimatePresence>
        {showCookie && (
          <CookieBanner onDismiss={() => setShowCookie(false)} />
        )}
      </AnimatePresence>

      {/* ── CHAT WIDGET ──────────────────────────────── */}
      <ChatWidget />

      {/* ── ACCOUNT DELETED CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showDeletedAlert && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Nunito', sans-serif",
            padding: "1rem"
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: "white",
                borderRadius: 24,
                padding: "2.5rem 2rem",
                maxWidth: 420,
                width: "100%",
                textAlign: "center",
                boxShadow: "0 25px 60px rgba(0,0,0,0.25)"
              }}
            >
              <div style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#e63946",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.2rem",
                color: "white",
                boxShadow: "0 8px 20px rgba(230, 57, 70, 0.25)"
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.8rem", margin: "0 0 10px", color: "#222" }}>
                Account Obliterated
              </h2>
              <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.5, margin: "0 0 24px" }}>
                Your account and all spice settings (including Cumin) have been permanently and successfully deleted from our database. We've cleaned the kitchen!
              </p>
              <button
                onClick={() => setShowDeletedAlert(false)}
                style={{
                  background: "#e63946",
                  color: "white",
                  border: "none",
                  borderRadius: 100,
                  padding: "0.8rem 2.5rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                  boxShadow: "0 5px 15px rgba(230, 57, 70, 0.2)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#b3212c"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#e63946"}
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Foody;