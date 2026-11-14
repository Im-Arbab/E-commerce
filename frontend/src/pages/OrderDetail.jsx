import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { orderAPI } from "../api/endpoints";
import Loader from "../components/common/Loader";
import { formatPrice, formatDate } from "../utils/format";

export default function OrderDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    orderAPI
      .getOne(id)
      .then(({ data }) => setOrder(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success("Payment successful! Your order is being processed.");
    } else if (paymentStatus === "cancelled") {
      toast.error("Payment was cancelled. You can retry from your order history.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return <div className="container-page py-24 text-center text-ink/50">Order not found.</div>;

  return (
    <div className="container-page py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="eyebrow">Order #{order._id.slice(-8).toUpperCase()}</span>
          <h1 className="text-2xl font-bold mt-1">{formatDate(order.createdAt)}</h1>
        </div>
        <span
          className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${
            order.isPaid ? "text-grade-a bg-grade-a/10" : "text-brass-dark bg-brass/10"
          }`}
        >
          {order.isPaid ? <FiCheckCircle /> : <FiClock />}
          {order.isPaid ? "Paid" : "Payment Pending"}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="card border border-ink/10 p-4">
          <h3 className="font-semibold text-sm mb-2">Shipping Address</h3>
          <p className="text-sm text-ink/70">
            {order.shippingAddress.fullName}<br />
            {order.shippingAddress.street}, {order.shippingAddress.city}<br />
            {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.country}<br />
            {order.shippingAddress.phone}
          </p>
        </div>
        <div className="card border border-ink/10 p-4">
          <h3 className="font-semibold text-sm mb-2">Order Status</h3>
          <p className="text-sm text-ink/70">Current status: <span className="font-medium text-ink">{order.orderStatus}</span></p>
          <p className="text-sm text-ink/70 mt-1">Payment method: {order.paymentMethod}</p>
          {order.isDelivered && (
            <p className="text-sm text-grade-a mt-1">Delivered on {formatDate(order.deliveredAt)}</p>
          )}
        </div>
      </div>

      <div className="card border border-ink/10 divide-y divide-ink/10 mb-6">
        {order.orderItems.map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <img src={item.image} alt={item.title} className="h-14 w-14 rounded-xs object-cover" />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-ink/50">Qty: {item.qty}</p>
            </div>
            <p className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</p>
          </div>
        ))}
      </div>

      <div className="card border border-ink/10 p-5 max-w-sm ml-auto space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-ink/60">Items</span><span>{formatPrice(order.itemsPrice)}</span></div>
        <div className="flex justify-between"><span className="text-ink/60">Shipping</span><span>{order.shippingPrice === 0 ? "Free" : formatPrice(order.shippingPrice)}</span></div>
        <div className="flex justify-between"><span className="text-ink/60">Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
        <div className="flex justify-between font-bold text-base border-t border-ink/10 pt-2"><span>Total</span><span>{formatPrice(order.totalPrice)}</span></div>
      </div>
    </div>
  );
}
