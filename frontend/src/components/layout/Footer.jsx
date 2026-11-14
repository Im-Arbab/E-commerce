import { Link } from "react-router-dom";
import { FiShield, FiTruck, FiRefreshCw } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-paper/80">
      <div className="container-page py-12 grid gap-10 md:grid-cols-4">
        <div>
          <span className="font-display text-xl font-bold text-paper">
            Lappy<span className="text-circuit-light">Shop</span>
          </span>
          <p className="mt-3 text-sm text-paper/60 max-w-xs">
            Every refurbished laptop is honestly graded, checked across 30+ points, and backed by a
            three-month warranty.
          </p>
        </div>

        <div>
          <h4 className="eyebrow text-paper/50">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-paper">All Laptops</Link></li>
            <li><Link to="/shop?category=Gaming" className="hover:text-paper">Gaming</Link></li>
            <li><Link to="/shop?category=Business" className="hover:text-paper">Business</Link></li>
            <li><Link to="/shop?category=Ultrabook" className="hover:text-paper">Ultrabooks</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-paper/50">Account</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/account/orders" className="hover:text-paper">Order History</Link></li>
            <li><Link to="/account/profile" className="hover:text-paper">My Profile</Link></li>
            <li><Link to="/login" className="hover:text-paper">Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-paper/50">Why LappyShop</h4>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex items-center gap-2"><FiShield className="text-circuit-light" /> 3-month laptop warranty</li>
            <li className="flex items-center gap-2"><FiRefreshCw className="text-circuit-light" /> Graded A / B / C condition</li>
            <li className="flex items-center gap-2"><FiTruck className="text-circuit-light" /> Free shipping over ₹50,000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10 py-4 text-center text-xs text-paper/40 font-mono">
        © {new Date().getFullYear()} LappyShop by Divine Technology. Inspected tech, ready for its next chapter.
      </div>
    </footer>
  );
}
