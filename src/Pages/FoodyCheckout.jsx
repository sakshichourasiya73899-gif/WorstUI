import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Minus, Plus, Trash2, CheckCircle2, ArrowLeft } from "lucide-react";
import { useCart } from "@/foody/CartContext";
const FoodyCheckout = () => {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, total, clear } = useCart();
  const [address, setAddress] = useState({ name: "", street: "", city: "", zip: "" });
  const [payment, setPayment] = useState("card");
  const [placed, setPlaced] = useState(false);
  const [errors, setErrors] = useState({});
  const delivery = items.length > 0 ? 4.99 : 0;
  const grand = total + delivery;
  const placeOrder = (e) => {
    e.preventDefault();
    const er = {};
    if (!address.name) er.name = true;
    if (!address.street) er.street = true;
    if (!address.city) er.city = true;
    if (!address.zip) er.zip = true;
    setErrors(er);
    if (Object.keys(er).length || items.length === 0) return;
    setPlaced(true);
    clear();
  };
  if (placed) {
    return (
      <div className="min-h-screen bg-[#f5f1f1] flex items-center justify-center px-6 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] p-12 max-w-md w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-[#e63946]/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-[#e63946]" />
          </motion.div>
          <h2 className="font-serif text-3xl mb-2">Order placed!</h2>
          <p className="text-neutral-500 text-sm mb-8">
            Thank you. Your delicious meal is on its way.
          </p>
          <button
            onClick={() => navigate("/foody")}
            className="bg-[#e63946] hover:bg-[#d12d3a] text-white px-8 py-3 rounded-full text-sm font-medium transition"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f5f1f1] font-sans pb-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        <Link to="/foody" className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to menu
        </Link>
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Checkout</h1>
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Left - form */}
          <div className="space-y-6">
            <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h2 className="font-semibold mb-5">Delivery Address</h2>
              <form onSubmit={placeOrder} className="grid sm:grid-cols-2 gap-4">
                <input
                  placeholder="Full name"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  className={`sm:col-span-2 bg-[#f5f1f1] rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]/30 ${errors.name ? "ring-2 ring-[#e63946]/40" : ""}`}
                />
                <input
                  placeholder="Street address"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className={`sm:col-span-2 bg-[#f5f1f1] rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]/30 ${errors.street ? "ring-2 ring-[#e63946]/40" : ""}`}
                />
                <input
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className={`bg-[#f5f1f1] rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]/30 ${errors.city ? "ring-2 ring-[#e63946]/40" : ""}`}
                />
                <input
                  placeholder="ZIP"
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  className={`bg-[#f5f1f1] rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946]/30 ${errors.zip ? "ring-2 ring-[#e63946]/40" : ""}`}
                />
              </form>
            </div>
            <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h2 className="font-semibold mb-5">Payment Method</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "card", label: "Card" },
                  { id: "paypal", label: "PayPal" },
                  { id: "cash", label: "Cash" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPayment(p.id)}
                    className={`py-3.5 rounded-full text-sm font-medium transition ${payment === p.id
                        ? "bg-[#e63946] text-white shadow-md"
                        : "bg-[#f5f1f1] text-neutral-700 hover:bg-neutral-200"
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Right - order summary */}
          <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-fit lg:sticky lg:top-8">
            <h2 className="font-semibold mb-5">Order Summary</h2>
            {items.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">
                Your cart is empty.<br />
                <Link to="/foody" className="text-[#e63946] hover:underline mt-2 inline-block">Browse menu</Link>
              </p>
            ) : (
              <>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {items.map((it) => (
                      <motion.div
                        key={it.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-3"
                      >
                        <img src={it.image} alt={it.name} className="w-14 h-14 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{it.name}</p>
                          <p className="text-xs text-neutral-500">${it.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#f5f1f1] rounded-full px-1.5 py-1">
                          <button
                            onClick={() => updateQty(it.id, it.qty - 1)}
                            className="w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-neutral-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-medium w-5 text-center">{it.qty}</span>
                          <button
                            onClick={() => updateQty(it.id, it.qty + 1)}
                            className="w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-neutral-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(it.id)} className="text-neutral-400 hover:text-[#e63946]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="border-t border-neutral-100 mt-6 pt-5 space-y-2 text-sm">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Delivery</span>
                    <span>${delivery.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-neutral-900 pt-2 text-base">
                    <span>Total</span>
                    <span>${grand.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={placeOrder}
                  className="w-full bg-[#e63946] hover:bg-[#d12d3a] text-white py-3.5 rounded-full text-sm font-medium transition shadow-md mt-6"
                >
                  Place Order
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FoodyCheckout;