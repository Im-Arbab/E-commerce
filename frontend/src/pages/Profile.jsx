import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    password: "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
    },
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, phone: form.phone, address: form.address };
      if (form.password) payload.password = form.password;
      await updateProfile(payload);
      toast.success("Profile updated");
      setForm({ ...form, password: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">My Profile</h1>
      <p className="text-sm text-ink/50 mb-8">{user?.email}</p>

      <form onSubmit={handleSubmit} className="card border border-ink/10 p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </div>
        </div>

        <div>
          <label className="label">New Password (leave blank to keep current)</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
        </div>

        <h3 className="font-semibold text-sm pt-2">Default Shipping Address</h3>
        <div>
          <label className="label">Street</label>
          <input value={form.address.street} onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} className="input" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">City</label>
            <input value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} className="input" />
          </div>
          <div>
            <label className="label">State</label>
            <input value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} className="input" />
          </div>
          <div>
            <label className="label">Postal Code</label>
            <input value={form.address.postalCode} onChange={(e) => setForm({ ...form, address: { ...form.address, postalCode: e.target.value } })} className="input" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
