import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FoodCard from "./FoodCard";

const GAP = 16;

const MenuCarousel = ({ foods }) => {
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(4);
    const [cardPx, setCardPx] = useState(0);
    const wrapperRef = useRef(null);

    const measure = () => {
        if (!wrapperRef.current) return;
        const w = wrapperRef.current.offsetWidth;
        const win = window.innerWidth;
        const v = win < 640 ? 2 : win < 1024 ? 3 : 4;
        setVisible(v);
        setCardPx((w - GAP * (v - 1)) / v);
        setIndex(0);
    };

    useEffect(() => {
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    const maxIndex = Math.max(0, foods.length - visible);
    const slide = (dir) =>
        setIndex((prev) => Math.min(Math.max(prev + dir, 0), maxIndex));

    // Pure pixel values — no CSS calc strings, no sign issues
    const translateX = index * (cardPx + GAP);

    return (
        <section className="w-full py-10 px-6 md:px-12">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="font-serif text-3xl md:text-4xl text-neutral-900">Our Menu</h2>
                    <p className="text-sm text-neutral-500 mt-1">Hand-picked dishes from our chefs</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => slide(-1)}
                        disabled={index === 0}
                        className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 transition"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => slide(1)}
                        disabled={index >= maxIndex}
                        className="w-9 h-9 rounded-full bg-[#e63946] text-white flex items-center justify-center hover:bg-[#c1121f] disabled:opacity-30 transition"
                        aria-label="Next"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Clip wrapper — measure actual pixel width from here */}
            <div ref={wrapperRef} className="overflow-hidden -mx-2 px-2">
                <div className="pt-14">
                    <div
                        className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                        style={{
                            gap: `${GAP}px`,
                            transform: `translateX(-${translateX}px)`,
                        }}
                    >
                        {foods.map((food) => (
                            <div
                                key={food.id}
                                style={{
                                    flex: `0 0 ${cardPx}px`,
                                    minWidth: 0,
                                }}
                            >
                                <FoodCard food={food} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MenuCarousel;