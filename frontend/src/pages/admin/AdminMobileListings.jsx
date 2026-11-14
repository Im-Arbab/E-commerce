import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { mobileAPI } from "../../api/endpoints";
import { formatPrice } from "../../utils/format";

export default function AdminMobileListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => mobileAPI.reviewQueue().then(({ data }) => setListings(data)).catch(() => toast.error("Could not load phone listings.")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const setStatus = async (item, status) => {
    try { await mobileAPI.setStatus(item._id, status); toast.success(`Listing ${status}.`); load(); }
    catch (error) { toast.error(error.response?.data?.message || "Could not update listing."); }
  };
  return <div><div className="mb-6"><span className="eyebrow">Marketplace</span><h1 className="mt-1 text-2xl font-bold">Phone listings</h1><p className="mt-1 text-sm text-ink/50">Review submissions before they appear in the marketplace.</p></div>{loading ? <p>Loading listings…</p> : listings.length ? <div className="space-y-3">{listings.map((item) => <article key={item._id} className="card border border-ink/10 p-4 flex flex-wrap gap-4 items-start">{item.images?.[0] && <img src={item.images[0]} alt="" className="h-20 w-20 object-cover rounded-xs" />}<div className="flex-1 min-w-[220px]"><div className="flex flex-wrap gap-2 items-center"><h2 className="font-bold">{item.title}</h2><span className="text-xs uppercase tracking-wider text-circuit-dark">{item.status}</span></div><p className="text-sm text-ink/55">{item.brand} {item.model} · {item.condition} · {item.city} · {formatPrice(item.price)}</p><p className="text-sm mt-2">{item.description}</p><p className="text-xs text-ink/50 mt-2">Seller: {item.owner?.name} ({item.sellerType === "store" ? item.storeName : "Individual"})</p></div><div className="flex gap-2">{item.status === "pending" && <><button className="btn-primary" onClick={() => setStatus(item, "active")}>Approve</button><button className="btn-outline" onClick={() => setStatus(item, "rejected")}>Reject</button></>}{item.status === "active" && <button className="btn-outline" onClick={() => setStatus(item, "sold")}>Mark sold</button>}</div></article>)}</div> : <div className="card border border-ink/10 p-10 text-center text-ink/50">No phone listings to review yet.</div>}</div>;
}
