import { useRef } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, BadgePercent, Truck, UtensilsCrossed, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/foody/Navbar";
import FoodCard from "@/foody/FoodCard";
import { foods, heroBowl } from "@/foody/data";

/* ─── Decorative SVG leaf ─────────────────────────────── */
const Leaf = ({ size = 40, rotate = 0, opacity = 0.82 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    style={{ transform: `rotate(${rotate}deg)`, opacity, display: "block" }}
  >
    <path
      d="M20 36 C20 36 20 20 20 8 C14 10 8 16 8 24 C8 30 13 35 20 36 Z"
      fill="#4ade80"
    />
    <path
      d="M20 36 C20 36 20 20 20 8 C26 10 32 16 32 24 C32 30 27 35 20 36 Z"
      fill="#22c55e"
      opacity="0.6"
    />
    <line x1="20" y1="8" x2="20" y2="36" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const Foody = () => {
  const navigate = useNavigate();
  const scrollerRef = useRef(null);

  const scrollMenu = (dir) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  const scrollToMenu = () =>
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-[#f5f1f1] font-sans text-neutral-900 overflow-x-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────── */}
      <section id="home" className="max-w-7xl mx-auto px-6 md:px-12 pt-10 pb-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Left */}
          <div className="text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight"
            >
              it's not just<br />Food, It's an<br />Experience.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-5 text-neutral-500 text-base leading-relaxed max-w-sm mx-auto md:mx-0"
            >
              Crafted with the finest seasonal ingredients — every dish a quiet celebration of flavor.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-3 mt-8 justify-center md:justify-start"
            >
              <button
                onClick={scrollToMenu}
                className="bg-[#e63946] hover:bg-[#d12d3a] active:scale-95 text-white px-8 py-3.5 rounded-full text-sm font-medium shadow-md shadow-[#e63946]/30 transition-all"
              >
                View Menu
              </button>
              <button className="bg-white hover:bg-neutral-50 active:scale-95 text-neutral-900 px-8 py-3.5 rounded-full text-sm font-medium border border-neutral-200 shadow-sm transition-all">
                Book A Table
              </button>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8"
            >
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium mb-3">Reviews</p>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="flex -space-x-2">
                  {["14", "32", "47"].map((n) => (
                    <img key={n} src={`https://i.pravatar.cc/40?img=${n}`} alt="" className="w-9 h-9 rounded-full border-2 border-[#f5f1f1] object-cover" />
                  ))}
                  <div className="w-9 h-9 rounded-full bg-neutral-900 text-white text-[10px] font-medium flex items-center justify-center border-2 border-[#f5f1f1]">45+</div>
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">from 45+ reviews</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — food image with leaves */}
          <div className="relative flex items-center justify-center mt-4 md:mt-0">
            {/* Decorative leaves */}
            <motion.div
              animate={{ rotate: [0, 8, 0], y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 right-4 md:right-0 z-10"
            >
              <Leaf size={42} rotate={20} />
            </motion.div>

            <motion.div
              animate={{ rotate: [0, -10, 0], y: [0, 7, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 -left-4 z-10"
            >
              <Leaf size={34} rotate={-30} />
            </motion.div>

            <motion.div
              animate={{ rotate: [0, 12, 0], y: [0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 -left-8 hidden md:block z-10"
            >
              <Leaf size={28} rotate={-60} opacity={0.6} />
            </motion.div>

            {/* Floating food bowl */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-0"
            >
              <div className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[430px] md:h-[430px] rounded-full overflow-hidden shadow-2xl bg-white">
                <img src={heroBowl} alt="Penne Arrabiata" className="w-full h-full object-cover" />
              </div>

              {/* Discount badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -left-6 md:-left-14 top-10 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-[#e63946]/10 flex items-center justify-center">
                  <BadgePercent className="w-4 h-4 text-[#e63946]" />
                </div>
                <div>
                  <p className="text-base font-bold leading-none">5%</p>
                  <p className="text-[10px] text-[#e63946] font-semibold mt-0.5">
                    Discount <span className="text-neutral-400 font-normal">for 2 orders</span>
                  </p>
                </div>
              </motion.div>

              {/* Tomato emoji */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity }}
                className="absolute -bottom-3 right-10 text-2xl select-none"
              >
                🍅
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MENU ─────────────────────────────────────── */}
      <section id="menu" className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl">Our Menu</h2>
            <p className="text-sm text-neutral-500 mt-1">Hand-picked dishes from our chefs</p>
          </div>
          <div className="hidden md:flex gap-2">
            <button onClick={() => scrollMenu(-1)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scrollMenu(1)} className="w-10 h-10 rounded-full bg-[#e63946] text-white flex items-center justify-center hover:bg-[#d12d3a] transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scroller — extra pt so floating card images aren't clipped */}
        <div className="relative">
          <div
            ref={scrollerRef}
            className="flex gap-5 overflow-x-auto pb-6 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", paddingTop: "64px" }}
          >
            {foods.map((f) => (
              <div key={f.id} className="shrink-0 w-[220px] md:w-[240px]">
                <FoodCard food={f} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile arrows */}
        <div className="flex md:hidden gap-2 justify-center mt-2">
          <button onClick={() => scrollMenu(-1)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scrollMenu(1)} className="w-10 h-10 rounded-full bg-[#e63946] text-white flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────── */}
      <section id="about" className="bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-20 text-center">
          <h2 className="font-serif text-3xl md:text-4xl">About Foody</h2>
          <p className="text-neutral-500 mt-5 max-w-xl mx-auto leading-relaxed text-[15px]">
            We craft thoughtful, beautiful food experiences using the finest seasonal ingredients.
            Every dish is plated with care — every bite a quiet celebration.
          </p>

          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: UtensilsCrossed,
                title: "Farm to Table",
                desc: "Sourced fresh daily from local farms and trusted suppliers.",
              },
              {
                icon: ShieldCheck,
                title: "Expert Chefs",
                desc: "Our team trained at some of the world's finest restaurants.",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Hot and fresh, delivered to your door in under 30 minutes.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 text-left hover:border-neutral-200 transition">
                <div className="w-10 h-10 rounded-xl bg-[#e63946]/8 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#e63946]" />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-1.5">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer id="contact" className="border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-400">
          <p className="font-serif italic text-lg text-neutral-800">
            F<span className="text-[#e63946]">oo</span>dy
          </p>
          <p>© 2026 Foody. All rights reserved.</p>
          <p>hello@foody.com</p>
        </div>
      </footer>
    </div>
  );
};

export default Foody;