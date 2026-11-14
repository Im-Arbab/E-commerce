import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(searchParams.get("redirect") || (user.role === "admin" ? "/admin" : "/"));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="text-sm text-ink/50 mt-1">Login to your LappyShop account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        Don't have an account?{" "}
        <Link to="/register" className="text-circuit-dark font-medium hover:underline">
          Create one
        </Link>
      </p>

      <div className="mt-6 card border border-ink/10 p-4 text-xs text-ink/50 font-mono">
        Demo admin: admin@laptopstore.com / admin123<br />
        Demo customer: customer@laptopstore.com / customer123
      </div>
    </div>
  );
}
