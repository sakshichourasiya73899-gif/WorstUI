import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "./CartContext";

const Navbar = () => {
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const navLinks = [
    { label: "Home",     id: "home"    },
    { label: "Menu",     id: "menu"    },
    { label: "About Us", id: "about"   },
    { label: "Contact",  id: "contact" },
  ];

  return (
    <>
      <nav className="w-full sticky top-0 z-50 bg-[#f5f1f1]/90 backdrop-blur-md border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-5 md:px-12 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/foody" className="text-2xl font-serif italic tracking-tight text-neutral-900 shrink-0">
            F<span className="text-[#e63946]">oo</span>dy
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-[15px] text-neutral-600">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="relative hover:text-neutral-900 transition-colors group"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#e63946] rounded-full transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => navigate("/foody/checkout")}
              className="relative w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:border-neutral-300 hover:shadow-sm transition"
              aria-label="Cart"
            >
              <ShoppingCart className="w-[18px] h-[18px] text-neutral-700" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e63946] text-white text-[10px] flex items-center justify-center font-medium">
                  {count}
                </span>
              )}
            </button>

            {/* Sign Up */}
            <button
              onClick={() => navigate("/foody/auth")}
              className="hidden sm:block bg-[#e63946] hover:bg-[#d12d3a] text-white px-5 py-2.5 rounded-full text-sm font-medium transition shadow-sm"
            >
              Sign Up
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-[#f5f1f1] border-t border-neutral-200/50"
            >
              <div className="px-5 py-4 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => scrollTo(l.id)}
                    className="text-left py-3 px-4 rounded-xl text-neutral-700 font-medium hover:bg-white hover:text-neutral-900 transition-all"
                  >
                    {l.label}
                  </button>
                ))}
                <button
                  onClick={() => { setMenuOpen(false); navigate("/foody/auth"); }}
                  className="mt-2 bg-[#e63946] hover:bg-[#d12d3a] text-white py-3 rounded-full text-sm font-medium transition"
                >
                  Sign Up
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;