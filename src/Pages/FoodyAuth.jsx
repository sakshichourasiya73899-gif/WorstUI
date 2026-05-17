import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
const FoodyAuth = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (isSignup && !form.name.trim()) e.name = "Name required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    localStorage.setItem("foody_user", JSON.stringify({ name: form.name || form.email.split("@")[0], email: form.email }));
    navigate("/foody");
  };
  return (
    <div className="min-h-screen bg-[#f5f1f1] flex items-center justify-center px-6 py-12 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
      >
        <Link to="/foody" className="block text-center text-3xl font-serif italic mb-1">
          F<span className="text-[#e63946]">oo</span>dy
        </Link>
        <p className="text-center text-sm text-neutral-500 mb-8">
          {isSignup ? "Create your account" : "Welcome back"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {isSignup && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#f5f1f1] rounded-full pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]/30"
                  />
                </div>
                {errors.name && <p className="text-xs text-[#e63946] mt-1 ml-4">{errors.name}</p>}
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#f5f1f1] rounded-full pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]/30"
              />
            </div>
            {errors.email && <p className="text-xs text-[#e63946] mt-1 ml-4">{errors.email}</p>}
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#f5f1f1] rounded-full pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]/30"
              />
            </div>
            {errors.password && <p className="text-xs text-[#e63946] mt-1 ml-4">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-[#e63946] hover:bg-[#d12d3a] text-white py-3.5 rounded-full text-sm font-medium transition shadow-md mt-2"
          >
            {isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>
        <p className="text-center text-sm text-neutral-500 mt-6">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => { setIsSignup(!isSignup); setErrors({}); }}
            className="text-[#e63946] font-medium hover:underline"
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
export default FoodyAuth;