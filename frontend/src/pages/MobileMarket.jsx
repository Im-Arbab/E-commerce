import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowUpRight, FiChevronLeft, FiChevronRight, FiMapPin, FiShield, FiSmartphone, FiX } from "react-icons/fi";
import { mobileAPI } from "../api/endpoints";
import MobileHeroCarousel from "../components/common/MobileHeroCarousel";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";

function BrowseShelf({ title, subtitle, className, children }) {
  const track = useRef(null);
  const scroll = (direction) => track.current?.scrollBy({ left: track.current.clientWidth * direction * 0.8, behavior: "smooth" });
  return <div className={`phone-browse-shelf ${className || ""}`}><div className="phone-browse-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><div className="phone-browse-arrows"><button type="button" onClick={() => scroll(-1)} aria-label={`Previous ${title.toLowerCase()}`}><FiChevronLeft /></button><button type="button" onClick={() => scroll(1)} aria-label={`More ${title.toLowerCase()}`}><FiChevronRight /></button></div></div><div className="phone-browse-track" ref={track}>{children}</div></div>;
}

const initialForm = { title: "", brand: "Apple", model: "", condition: "Good", price: "", originalPrice: "", storage: "", color: "", batteryHealth: "", description: "", images: "", city: "", sellerType: "individual", storeName: "", sellerPhone: "" };

export default function MobileMarket() {
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [browseListings, setBrowseListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ keyword: "", city: "", category: "", brand: "", minPrice: "", maxPrice: "" });
  const [inquiry, setInquiry] = useState(null);
  const [message, setMessage] = useState("");

  const load = () => {
    setLoading(true);
    mobileAPI.list({ ...filters, limit: 24 }).then(({ data }) => { setListings(data.listings); setTotal(data.total); }).catch(() => toast.error("Could not load phone listings.")).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filters.keyword, filters.city, filters.category, filters.brand, filters.minPrice, filters.maxPrice]);
  useEffect(() => {
    mobileAPI.list({ limit: 48 }).then(({ data }) => setBrowseListings(data.listings || [])).catch(() => setBrowseListings([]));
  }, []);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const phoneCategories = useMemo(() => [
    { value: "iphone", title: "iPhone", caption: "Apple phones", match: (item) => item.brand === "Apple" },
    { value: "android", title: "Android", caption: "Samsung, Pixel & more", match: (item) => item.brand !== "Apple" },
    { value: "new", title: "Like new", caption: "New and excellent condition", match: (item) => ["New", "Like New"].includes(item.condition) },
    { value: "stores", title: "Store listings", caption: "Browse trusted shops", match: (item) => item.sellerType === "store" },
  ].map((category) => ({ ...category, image: browseListings.find(category.match)?.images?.[0] || browseListings[0]?.images?.[0] })), [browseListings]);
  const phoneBrands = useMemo(() => [...new Set(browseListings.map((item) => item.brand).filter(Boolean))].sort().map((brand) => ({
    brand,
    count: browseListings.filter((item) => item.brand === brand).length,
    image: browseListings.find((item) => item.brand === brand && item.images?.[0])?.images?.[0],
  })), [browseListings]);
  const phonePrices = useMemo(() => [
    { title: "Under ₹20,000", minPrice: "0", maxPrice: "19999", caption: "Budget picks" },
    { title: "₹20,000–₹40,000", minPrice: "20000", maxPrice: "40000", caption: "Great everyday phones" },
    { title: "₹40,000–₹60,000", minPrice: "40000", maxPrice: "60000", caption: "Premium favourites" },
    { title: "Above ₹60,000", minPrice: "60001", maxPrice: "250000", caption: "Flagship phones" },
  ].map((range) => ({ ...range, count: browseListings.filter((item) => item.price >= Number(range.minPrice) && item.price <= Number(range.maxPrice)).length, image: browseListings.find((item) => item.price >= Number(range.minPrice) && item.price <= Number(range.maxPrice) && item.images?.[0])?.images?.[0] })), [browseListings]);
  const chooseCategory = (value) => setFilters((current) => ({ ...current, category: current.category === value ? "" : value, brand: "", minPrice: "", maxPrice: "" }));
  const chooseBrand = (brand) => setFilters((current) => ({ ...current, brand: current.brand === brand ? "" : brand, category: "" }));
  const choosePrice = (range) => setFilters((current) => ({ ...current, minPrice: current.minPrice === range.minPrice ? "" : range.minPrice, maxPrice: current.minPrice === range.minPrice ? "" : range.maxPrice, category: "", brand: "" }));

  const submitListing = async (event) => {
    event.preventDefault(); setSubmitting(true);
    try {
      const payload = { ...form, images: form.images.split(/\n|,/).map((url) => url.trim()).filter(Boolean) };
      const { data } = await mobileAPI.create(payload);
      toast.success(data.message); setForm(initialForm); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) { toast.error(error.response?.data?.message || "Please check your listing and try again."); }
    finally { setSubmitting(false); }
  };

  const sendInquiry = async (event) => {
    event.preventDefault();
    try {
      const { data } = await mobileAPI.inquire(inquiry._id, message);
      toast.success(data.message); setInquiry(null); setMessage("");
    } catch (error) { toast.error(error.response?.data?.message || "Could not send inquiry."); }
  };

  return <div className="market-page">
    <section className="market-hero"><div className="container-page market-hero-inner"><div className="market-hero-copy"><span className="eyebrow">The LappyShop marketplace</span><h1>Good tech deserves<br /><em>another life.</em></h1><p>Find a pre-loved phone from people and stores in your city. Or list yours in a few minutes.</p><a className="btn-accent" href="#list-your-phone">List your phone <FiArrowUpRight /></a></div><div className="market-hero-art"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><MobileHeroCarousel listings={browseListings} /><span className="market-note">A better way to pass it on.</span></div></div></section>
    <section className="container-page market-trust"><div><FiShield /><span>Listings reviewed before publishing</span></div><div><FiMapPin /><span>Shop from sellers near you</span></div><div><FiSmartphone /><span>New and used devices</span></div></section>

    <section className="container-page phone-browse-section">
      <BrowseShelf title="Shop by category" subtitle="Find a phone that fits how you use it." className="phone-category-shelf">
        {phoneCategories.map((item) => <button type="button" key={item.value} onClick={() => chooseCategory(item.value)} className={`phone-browse-card ${filters.category === item.value ? "is-selected" : ""}`}><img src={item.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80"} alt="" loading="lazy" /><span className="phone-browse-shade" /><strong>{item.title}</strong><small>{item.caption}</small><FiArrowUpRight /></button>)}
      </BrowseShelf>
      <BrowseShelf title="Shop by brand" subtitle="Browse phones from brands you know." className="phone-brand-shelf">
        {phoneBrands.map((item) => <button type="button" key={item.brand} onClick={() => chooseBrand(item.brand)} className={`phone-browse-card ${filters.brand === item.brand ? "is-selected" : ""}`}><img src={item.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80"} alt={`${item.brand} phone`} loading="lazy" /><span className="phone-browse-shade" /><strong>{item.brand}</strong><small>{item.count} {item.count === 1 ? "phone" : "phones"}</small><FiArrowUpRight /></button>)}
      </BrowseShelf>
      <BrowseShelf title="Shop by price range" subtitle="Choose a budget to narrow down the listings." className="phone-price-shelf">
        {phonePrices.map((item) => <button type="button" key={item.title} onClick={() => choosePrice(item)} className={`phone-browse-card ${filters.minPrice === item.minPrice && filters.maxPrice === item.maxPrice ? "is-selected" : ""}`}><img src={item.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80"} alt="" loading="lazy" /><span className="phone-browse-shade" /><strong>{item.title}</strong><small>{item.count} {item.count === 1 ? "phone" : "phones"} · {item.caption}</small><FiArrowUpRight /></button>)}
      </BrowseShelf>
    </section>

    <section className="container-page market-content"><div className="market-heading"><div><span className="eyebrow">Pre-loved, well found</span><h2>Phones people are selling</h2><p className="mt-1 text-sm text-ink/50">{total} listings</p></div><div className="market-filters"><input className="input" placeholder="Search phones" value={filters.keyword} onChange={(e) => setFilters((v) => ({ ...v, keyword: e.target.value }))} /><input className="input" placeholder="City" value={filters.city} onChange={(e) => setFilters((v) => ({ ...v, city: e.target.value }))} /></div></div>
      {loading ? <p className="py-12 text-center text-ink/50">Finding phones…</p> : listings.length ? <div className="mobile-grid" id="listings">{listings.map((item) => <article className="mobile-card" id={`listing-${item._id}`} key={item._id}><div className="mobile-photo">{item.images?.[0] ? <img src={item.images[0]} alt={item.title} /> : <FiSmartphone />}{item.sellerType === "store" && <span className="store-pill">Store</span>}</div><div className="p-4"><div className="flex justify-between items-start gap-2"><div><p className="text-xs uppercase tracking-wider text-circuit-dark">{item.brand} · {item.condition}</p><h3 className="mt-1 text-base font-bold">{item.title}</h3></div><span className="text-xs text-ink/50 whitespace-nowrap">{item.city}</span></div><p className="mt-2 text-sm text-ink/55 line-clamp-2">{item.description}</p><div className="mt-4 flex justify-between items-center gap-2"><strong className="text-lg">{formatPrice(item.price)}</strong><button className="seller-contact" onClick={() => isAuthenticated ? setInquiry(item) : toast("Sign in to contact the seller")}>Message seller <FiArrowUpRight /></button></div><p className="mt-3 text-xs text-ink/45">{item.storage || "Details on request"}{item.batteryHealth ? ` · Battery ${item.batteryHealth}` : ""}</p></div></article>)}</div> : <div className="empty-market"><FiSmartphone /><h3>Fresh listings are on the way</h3><p>Be the first to list a phone for your community.</p></div>}
    </section>

    <section className="container-page sell-section" id="list-your-phone"><div className="sell-intro"><span className="eyebrow">Sell simply</span><h2>Turn your old phone<br />into someone’s next.</h2><p>Individuals and stores are welcome. Add the details buyers care about; our team reviews every listing before it goes live.</p><div className="sell-step"><b>01</b><span>Describe your phone honestly</span></div><div className="sell-step"><b>02</b><span>We review your listing</span></div><div className="sell-step"><b>03</b><span>Connect with interested buyers</span></div></div><form className="sell-form" onSubmit={submitListing}><h3>List a phone</h3>{!isAuthenticated && <p className="form-hint">Please <Link to="/login">sign in</Link> to submit your listing.</p>}<div className="form-grid"><label className="label">Listing title<input required className="input" maxLength="120" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="iPhone 13, excellent condition" /></label><label className="label">Brand<input required className="input" value={form.brand} onChange={(e) => update("brand", e.target.value)} /></label><label className="label">Model<input required className="input" value={form.model} onChange={(e) => update("model", e.target.value)} /></label><label className="label">Condition<select className="input" value={form.condition} onChange={(e) => update("condition", e.target.value)}>{["New", "Like New", "Good", "Fair"].map((x) => <option key={x}>{x}</option>)}</select></label><label className="label">Price (₹)<input required type="number" min="1" className="input" value={form.price} onChange={(e) => update("price", e.target.value)} /></label><label className="label">City<input required className="input" value={form.city} onChange={(e) => update("city", e.target.value)} /></label><label className="label">Storage<input className="input" value={form.storage} onChange={(e) => update("storage", e.target.value)} placeholder="128 GB" /></label><label className="label">Battery health<input className="input" value={form.batteryHealth} onChange={(e) => update("batteryHealth", e.target.value)} placeholder="87%" /></label><label className="label">Seller type<select className="input" value={form.sellerType} onChange={(e) => update("sellerType", e.target.value)}><option value="individual">Individual</option><option value="store">Store</option></select></label>{form.sellerType === "store" && <label className="label">Store name<input required className="input" value={form.storeName} onChange={(e) => update("storeName", e.target.value)} /></label>}<label className="label">Contact phone<input required type="tel" className="input" value={form.sellerPhone} onChange={(e) => update("sellerPhone", e.target.value)} /></label><label className="label span-two">Photo links (one HTTPS link per line)<textarea className="input" rows="2" value={form.images} onChange={(e) => update("images", e.target.value)} placeholder="https://…" /></label><label className="label span-two">Description<textarea required maxLength="2000" className="input" rows="4" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Mention condition, included accessories, and any marks or repairs." /></label></div><button className="btn-primary w-full mt-5" disabled={!isAuthenticated || submitting}>{!isAuthenticated ? "Sign in to list your phone" : submitting ? "Submitting…" : "Submit for review"}</button><p className="text-xs text-ink/45 mt-3">Your phone number stays private. Buyers can send you an inquiry here.</p></form></section>

    {inquiry && <div className="inquiry-backdrop" role="presentation" onClick={() => setInquiry(null)}><form className="inquiry-modal" onSubmit={sendInquiry} onClick={(event) => event.stopPropagation()}><button className="inquiry-close" type="button" aria-label="Close" onClick={() => setInquiry(null)}><FiX /></button><span className="eyebrow">Ask the seller</span><h2>{inquiry.title}</h2><p>Send a message about this listing. The seller will see your account name.</p><label className="label">Your message<textarea className="input" required minLength="8" maxLength="1500" rows="5" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Hi, is this phone still available?" /></label><button className="btn-primary w-full" type="submit">Send inquiry <FiArrowUpRight /></button></form></div>}
  </div>;
}
