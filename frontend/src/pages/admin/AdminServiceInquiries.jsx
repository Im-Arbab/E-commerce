import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { serviceInquiryAPI } from "../../api/endpoints";

export default function AdminServiceInquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => serviceInquiryAPI.list().then(({ data }) => setItems(data)).catch(() => toast.error("Could not load sales requests.")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const updateStatus = async (item, status) => {
    try { await serviceInquiryAPI.setStatus(item._id, status); toast.success("Request status updated."); load(); }
    catch (error) { toast.error(error.response?.data?.message || "Could not update request."); }
  };
  return <div><div className="mb-6"><span className="eyebrow">Sales team</span><h1 className="mt-1 text-2xl font-bold">Service requests</h1><p className="mt-1 text-sm text-ink/50">Laptop rental and office setup requests submitted from the storefront.</p></div>{loading ? <p>Loading requests…</p> : items.length ? <div className="space-y-3">{items.map((item) => <article key={item._id} className="card border border-ink/10 p-5"><div className="flex flex-wrap justify-between gap-3"><div><span className={`service-request-type ${item.type}`}>{item.type === "rental" ? "Laptop rental" : "Office setup"}</span><h2 className="mt-2 font-bold text-lg">{item.name}{item.company ? ` · ${item.company}` : ""}</h2></div><select value={item.status} onChange={(event) => updateStatus(item, event.target.value)} className="input !w-auto !py-2 text-sm" aria-label={`Update status for ${item.name}`}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></div><p className="mt-3 text-sm text-ink/70">{item.message}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/55"><a className="hover:text-circuit-dark" href={`mailto:${item.email}`}>{item.email}</a><a className="hover:text-circuit-dark" href={`tel:${item.phone}`}>{item.phone}</a><span>{item.deviceCount} laptop{item.deviceCount === 1 ? "" : "s"}</span><time>{new Date(item.createdAt).toLocaleString()}</time></div></article>)}</div> : <div className="card border border-ink/10 p-10 text-center text-ink/50">No sales requests have arrived yet.</div>}</div>;
}
