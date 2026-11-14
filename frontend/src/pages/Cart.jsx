import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiArrowRight } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";

export default function Cart() {
  const { items, updateQty, removeItem, itemsPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate(isAuthenticated ? "/checkout" : "/login?redirect=/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink/50">Browse our catalog to find your next laptop.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Shop Laptops</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product} className="card border border-ink/10 p-4 flex gap-4">
              <img src={item.image} alt={item.title} className="h-20 w-20 rounded-xs object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <p className="text-ink/50 text-xs mt-1">{formatPrice(item.price)} each</p>
                <div className="mt-2 flex items-center gap-3">
                  <select
                    value={item.qty}
                    onChange={(e) => updateQty(item.product, Number(e.target.value))}
                    className="input !w-20 !py-1.5 !text-sm"
                  >
                    {Array.from({ length: Math.min(item.stock, 5) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeItem(item.product)}
                    className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                  >
                    <FiTrash2 size={14} /> Remove
                  </button>
                </div>
              </div>
              <p className="font-display font-bold text-sm shrink-0">{formatPrice(item.price * item.qty)}</p>
            </div>
          ))}
        </div>

        <div className="card border border-ink/10 p-5 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Subtotal</span>
              <span>{formatPrice(itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Shipping</span>
              <span>{itemsPrice > 50000 ? "Free" : formatPrice(499)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">GST (18%)</span>
              <span>{formatPrice(Math.round(itemsPrice * 0.18))}</span>
            </div>
            <div className="border-t border-ink/10 pt-2 flex justify-between font-bold text-base">
              <span>Total</span>
              <span>
                {formatPrice(
                  itemsPrice + (itemsPrice > 50000 ? 0 : 499) + Math.round(itemsPrice * 0.18)
                )}
              </span>
            </div>
          </div>
          <button onClick={handleCheckout} className="btn-primary w-full mt-5">
            Proceed to Checkout <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
