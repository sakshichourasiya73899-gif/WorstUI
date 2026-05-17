import { ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
const Navbar = () => {
  const { count } = useCart();
  const navigate = useNavigate();
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
      <Link to="/foody" className="text-3xl font-serif italic tracking-tight text-neutral-900">
        F<span className="text-[#e63946]">oo</span>dy
      </Link>
      <div className="hidden md:flex items-center gap-10 text-[15px] text-neutral-700">
        <button onClick={() => scrollTo("home")} className="text-[#e63946] font-medium">Home</button>
        <button onClick={() => scrollTo("menu")} className="hover:text-neutral-900 transition">Menu</button>
        <button onClick={() => scrollTo("about")} className="hover:text-neutral-900 transition">About Us</button>
        <button onClick={() => scrollTo("contact")} className="hover:text-neutral-900 transition">Contact</button>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/foody/checkout")}
          className="relative w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition"
          aria-label="Cart"
        >
          <ShoppingBag className="w-4 h-4 text-neutral-800" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e63946] text-white text-[10px] flex items-center justify-center font-medium">
              {count}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate("/foody/auth")}
          className="bg-[#e63946] hover:bg-[#d12d3a] text-white px-6 py-2.5 rounded-full text-sm font-medium transition shadow-sm"
        >
          Sign Up
        </button>
      </div>
    </nav>
  );
};
export default Navbar;