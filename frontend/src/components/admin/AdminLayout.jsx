import { NavLink, Outlet } from "react-router-dom";
import { FiGrid, FiBox, FiShoppingBag, FiUsers, FiArrowLeft, FiSmartphone, FiMessageSquare } from "react-icons/fi";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/admin/products", label: "Products", icon: FiBox },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { to: "/admin/users", label: "Users", icon: FiUsers },
  { to: "/admin/mobiles", label: "Phone Listings", icon: FiSmartphone },
  { to: "/admin/service-inquiries", label: "Sales Requests", icon: FiMessageSquare },
];

export default function AdminLayout() {
  return (
    <div className="container-page py-8 grid lg:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-1">
        <p className="eyebrow mb-3">Admin Panel</p>
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-xs text-sm font-medium ${
                isActive ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/5"
              }`
            }
          >
            <l.icon size={16} /> {l.label}
          </NavLink>
        ))}
        <NavLink to="/" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink/50 hover:text-ink mt-4">
          <FiArrowLeft size={16} /> Back to Store
        </NavLink>
      </aside>
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
