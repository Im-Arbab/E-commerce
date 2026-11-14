import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { mobileAPI } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function MobileInquiries() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const load = () => mobileAPI.inquiries().then(({ data }) => setItems(data)).catch(() => toast.error("Could not load inquiries.")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const reply = async (event, id) => {
    event.preventDefault();
    try { await mobileAPI.reply(id, drafts[id] || ""); setDrafts((prev) => ({ ...prev, [id]: "" })); load(); }
    catch (error) { toast.error(error.response?.data?.message || "Could not send reply."); }
  };
  return <div className="container-page py-10"><span className="eyebrow">Your marketplace</span><h1 className="text-2xl font-bold mt-1">Messages</h1><p className="text-sm text-ink/55 mt-1">Keep buyer and seller conversations in one private place.</p><div className="mt-6 space-y-4">{loading ? <p>Loading messages…</p> : items.length ? items.map((item) => <article key={item._id} className="card border border-ink/10 p-5"><div className="flex flex-wrap justify-between gap-2"><div><h2 className="font-bold">{item.listing?.title || "Phone listing"}</h2><p className="text-xs text-ink/50 mt-1">{item.buyer?._id === user?._id ? `Seller: ${item.seller?.name}` : `Buyer: ${item.buyer?.name}`}</p></div><span className="text-xs text-ink/45">{new Date(item.updatedAt).toLocaleDateString()}</span></div><div className="mt-4 space-y-2">{item.messages?.map((entry) => <p key={entry._id} className={`rounded-xs p-3 text-sm ${entry.sender?._id === user?._id ? "bg-[#edf2eb] ml-6" : "bg-[#f5f5f1] mr-6"}`}><span className="block text-[10px] uppercase tracking-wider text-ink/45 mb-1">{entry.sender?._id === user?._id ? "You" : entry.sender?.name}</span>{entry.body}</p>)}</div><form onSubmit={(event) => reply(event, item._id)} className="mt-4 flex gap-2"><input required minLength="2" maxLength="1500" className="input" placeholder="Write a reply…" value={drafts[item._id] || ""} onChange={(event) => setDrafts((prev) => ({ ...prev, [item._id]: event.target.value }))} /><button className="btn-primary shrink-0">Reply</button></form></article>) : <div className="card border border-ink/10 p-8 text-center text-ink/50">No messages yet. Ask a seller about a phone to start a conversation.</div>}</div></div>;
}
