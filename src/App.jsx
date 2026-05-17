import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Foody from "./Pages/Foody";
import FoodyAuth from "./Pages/FoodyAuth";
import FoodyCheckout from "./Pages/FoodyCheckout";
import { CartProvider } from "./foody/CartContext";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/foody" replace />} />
        <Route path="/" element={<Navigate to="/foody" replace />} />
        <Route path="/foody" element={<CartProvider><Foody /></CartProvider>} />
        <Route path="/foody/auth" element={<CartProvider><FoodyAuth /></CartProvider>} />
        <Route path="/foody/checkout" element={<CartProvider><FoodyCheckout /></CartProvider>} />
        <Route path="*" element={<Navigate to="/foody" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
