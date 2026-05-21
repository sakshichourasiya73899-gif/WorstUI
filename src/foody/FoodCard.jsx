import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";

const FoodCard = ({ food }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative bg-white rounded-[28px] pt-20 pb-6 px-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
    >
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full overflow-hidden shadow-md bg-white">
        <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
      </div>
      <button
        onClick={() => {
          const userStr = localStorage.getItem("currentUser");
          if (userStr) {
            addItem(food);
          } else {
            navigate("/foody/auth");
          }
        }}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-[#e63946] transition"
        aria-label={`Add ${food.name}`}
      >
        <ShoppingCart className="w-4 h-4" />
      </button>
      <div className="text-center mt-2">
        <h3 className="font-semibold text-neutral-900">{food.name}</h3>
        <p className="text-xs text-neutral-500 mt-1">{food.subtitle}</p>
        <p className="text-sm font-semibold text-neutral-900 mt-3">${food.price.toFixed(2)}</p>
      </div>
    </motion.div>
  );
};

export default FoodCard;