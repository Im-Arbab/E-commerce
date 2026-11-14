import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { orderAPI } from "../../api/endpoints";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { formatPrice, formatDate } from "../../utils/format";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    orderAPI
      .all({ page, status: statusFilter || undefined })
      .then(({ data }) => {
        setOrders(data.orders);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (order, status) => {
    try {
      await orderAPI.updateStatus(order._id, status);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, orderStatus: status } : o)));
      toast.success("Order status updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input !w-auto"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card border border-ink/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-xs text-ink/50 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-3 font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.user?.name}</p>
                    <p className="text-xs text-ink/40">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(o.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${o.isPaid ? "text-grade-a bg-grade-a/10" : "text-brass-dark bg-brass/10"}`}>
                      {o.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => handleStatusChange(o, e.target.value)}
                      className="input !w-36 !py-1.5 !text-xs"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center py-10 text-ink/50 text-sm">No orders found.</p>}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
