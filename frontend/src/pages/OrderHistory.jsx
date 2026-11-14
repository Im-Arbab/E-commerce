import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../api/endpoints";
import Loader from "../components/common/Loader";
import { formatPrice, formatDate } from "../utils/format";

const STATUS_COLOR = {
  Pending: "text-ink/60 bg-ink/5",
  Processing: "text-brass-dark bg-brass/10",
  Shipped: "text-circuit-dark bg-circuit/10",
  Delivered: "text-grade-a bg-grade-a/10",
  Cancelled: "text-red-600 bg-red-50",
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI
      .myOrders()
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center text-ink/50">
          <p>You haven't placed any orders yet.</p>
          <Link to="/shop" className="text-circuit-dark hover:underline text-sm">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/order/${o._id}`}
              className="card border border-ink/10 p-5 flex flex-wrap items-center justify-between gap-4 hover:border-circuit/40"
            >
              <div>
                <p className="font-mono text-xs text-ink/40">#{o._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm font-medium mt-1">{formatDate(o.createdAt)}</p>
                <p className="text-xs text-ink/50 mt-0.5">{o.orderItems.length} item(s)</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[o.orderStatus]}`}>
                {o.orderStatus}
              </span>
              <div className="text-right">
                <p className="font-display font-bold">{formatPrice(o.totalPrice)}</p>
                <p className="text-xs text-ink/40">{o.isPaid ? "Paid" : "Payment pending"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
