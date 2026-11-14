import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderAPI, paymentAPI } from "../api/endpoints";
import { formatPrice } from "../utils/format";

export default function Checkout() {
  const { items, itemsPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const shipping = itemsPrice > 50000 ? 0 : 499;
  const tax = Math.round(itemsPrice * 0.18);
  const total = itemsPrice + shipping + tax;

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setPlacing(true);
    try {
      const { data: order } = await orderAPI.create({
        orderItems: items.map((i) => ({ product: i.product, qty: i.qty, title: i.title })),
        shippingAddress: address,
        paymentMethod: "Stripe",
      });

      const { data: session } = await paymentAPI.createCheckoutSession(order._id);
      clearCart();

      if (session.url) {
        window.location.href = session.url;
      } else {
        navigate(`/order/${order._id}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 card border border-ink/10 p-6 space-y-4">
          <h2 className="font-semibold">Shipping Address</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input required name="fullName" value={address.fullName} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input required name="phone" value={address.phone} onChange={handleChange} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Street Address</label>
            <input required name="street" value={address.street} onChange={handleChange} className="input" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">City</label>
              <input required name="city" value={address.city} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">State</label>
              <input required name="state" value={address.state} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Postal Code</label>
              <input required name="postalCode" value={address.postalCode} onChange={handleChange} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Payment Method</label>
            <div className="input !flex items-center gap-2 bg-paper-dim">
              <span className="font-medium">Stripe (Card)</span>
              <span className="text-ink/40 text-xs ml-auto">Secure checkout via Stripe</span>
            </div>
          </div>

          <button type="submit" disabled={placing} className="btn-primary w-full mt-2">
            {placing ? "Placing order..." : `Pay ${formatPrice(total)}`}
          </button>
        </form>

        <div className="card border border-ink/10 p-5 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.product} className="flex justify-between text-sm">
                <span className="text-ink/70 truncate pr-2">{i.title} × {i.qty}</span>
                <span className="shrink-0">{formatPrice(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-ink/10 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>{formatPrice(itemsPrice)}</span></div>
            <div className="flex justify-between"><span className="text-ink/60">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-ink/60">GST (18%)</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-ink/10 pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
