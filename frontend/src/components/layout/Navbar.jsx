import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiGrid } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/shop?keyword=${encodeURIComponent(query.trim())}` : "/shop");
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="tech-announcement"><span>Free insured delivery on orders over ₹50,000</span><span className="announcement-divider">•</span><span>7-day replacement window</span><Link to="/shop">Shop deals <b>→</b></Link></div>
      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-xl font-bold text-ink">Lappy<span className="text-circuit">Shop</span><small className="brand-tag">BY DIVINE TECHNOLOGY</small></span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg">
          <div className="relative w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by brand, model, or spec..."
              className="input !pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink"
              aria-label="Search"
            >
              <FiSearch size={18} />
            </button>
          </div>
        </form>

        <nav className="hidden lg:flex items-center gap-6 font-medium text-sm text-ink/80">
          <Link to="/shop" className="hover:text-circuit">Shop All</Link>
          <Link to="/mobiles" className="hover:text-circuit">Phones</Link>
          <Link to="/shop?category=Gaming" className="hover:text-circuit">Gaming</Link>
          <Link to="/shop?category=Business" className="hover:text-circuit">Business</Link>
          <Link to="/shop?category=Ultrabook" className="hover:text-circuit">Ultrabooks</Link>
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <Link to="/cart" className="relative p-2 text-ink hover:text-circuit" aria-label="Cart">
            <FiShoppingCart size={20} />
            {itemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brass text-[10px] font-bold text-ink">
                {itemsCount}
              </span>
            )}
          </Link>

          <div className="relative hidden md:block">
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="p-2 text-ink hover:text-circuit flex items-center gap-1"
              aria-label="Account"
            >
              <FiUser size={20} />
            </button>
            {accountOpen && (
              <div
                className="absolute right-0 mt-2 w-56 card border border-ink/10 py-2 text-sm"
                onMouseLeave={() => setAccountOpen(false)}
              >
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 border-b border-ink/10">
                      <p className="font-semibold text-ink truncate">{user.name}</p>
                      <p className="text-ink/50 text-xs truncate">{user.email}</p>
                    </div>
                    <Link to="/account/profile" className="block px-4 py-2 hover:bg-ink/5" onClick={() => setAccountOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/account/orders" className="block px-4 py-2 hover:bg-ink/5" onClick={() => setAccountOpen(false)}>
                      My Orders
                    </Link>
                    <Link to="/account/inquiries" className="block px-4 py-2 hover:bg-ink/5" onClick={() => setAccountOpen(false)}>
                      Buyer Inquiries
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-ink/5 text-circuit-dark" onClick={() => setAccountOpen(false)}>
                        <FiGrid size={14} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-ink/5 text-red-600">
                      <FiLogOut size={14} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 hover:bg-ink/5" onClick={() => setAccountOpen(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="block px-4 py-2 hover:bg-ink/5" onClick={() => setAccountOpen(false)}>
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button className="md:hidden p-2 text-ink" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-ink/10 px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search laptops..."
              className="input !pr-10"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/50">
              <FiSearch size={18} />
            </button>
          </form>
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop All</Link>
            <Link to="/shop?category=Gaming" onClick={() => setMenuOpen(false)}>Gaming</Link>
            <Link to="/shop?category=Business" onClick={() => setMenuOpen(false)}>Business</Link>
            <Link to="/mobiles" onClick={() => setMenuOpen(false)}>Buy & sell phones</Link>
            {isAuthenticated ? (
              <>
                <Link to="/account/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
                {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                <button onClick={handleLogout} className="text-left text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>Create Account</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
