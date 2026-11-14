import { useEffect, useState } from "react";
import { orderAPI } from "../../api/endpoints";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/format";
import { FiDollarSign, FiShoppingBag, FiCheckCircle } from "react-icons/fi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    orderAPI.stats().then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <Loader />;

  const cards = [
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: FiDollarSign },
    { label: "Total Orders", value: stats.totalOrders, icon: FiShoppingBag },
    { label: "Paid Orders", value: stats.paidOrders, icon: FiCheckCircle },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card border border-ink/10 p-5">
            <c.icon className="text-circuit" size={20} />
            <p className="mt-3 text-2xl font-bold font-display">{c.value}</p>
            <p className="text-xs text-ink/50 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card border border-ink/10 p-5">
        <h2 className="font-semibold text-sm mb-4">Orders by Status</h2>
        <div className="space-y-3">
          {stats.statusBreakdown.map((s) => (
            <div key={s._id} className="flex items-center gap-3">
              <span className="w-24 text-xs text-ink/60">{s._id}</span>
              <div className="flex-1 h-2 bg-ink/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-circuit"
                  style={{ width: `${(s.count / stats.totalOrders) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono w-6 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
