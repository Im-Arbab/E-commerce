import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiBriefcase, FiCheck, FiChevronLeft, FiChevronRight, FiCommand, FiCpu, FiMonitor, FiRefreshCw, FiShield, FiSmartphone, FiTruck, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { productAPI, serviceInquiryAPI } from "../api/endpoints";
import ProductCard from "../components/common/ProductCard";
import Loader from "../components/common/Loader";
import HeroScreenCarousel from "../components/common/HeroScreenCarousel";

const promises = [
  { icon: FiCheck, title: "30+ quality checks", desc: "Key components and everyday functions checked before listing." },
  { icon: FiShield, title: "3-month warranty", desc: "Every LappyShop refurbished laptop comes with three months of cover." },
  { icon: FiTruck, title: "Delivery you can track", desc: "Insured shipping and updates from dispatch to your door." },
  { icon: FiRefreshCw, title: "Help after checkout", desc: "Support for returns, replacements and warranty questions." },
];
const brands = ["HP", "Dell", "Lenovo", "Apple", "Asus", "Acer", "MSI"];
const KEYBOARD_ROWS = [15, 15, 14, 12, 10];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceType, setServiceType] = useState("");
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: "", email: "", phone: "", company: "", deviceCount: "1", message: "" });
  const categoryScroller = useRef(null);
  const brandScroller = useRef(null);
  const priceScroller = useRef(null);
  const scrollShelf = (ref, direction) => ref.current?.scrollBy({ left: direction * ref.current.clientWidth * 0.85, behavior: "smooth" });
  const submitServiceInquiry = async (event) => {
    event.preventDefault();
    setServiceSubmitting(true);
    try {
      const { data } = await serviceInquiryAPI.create({ ...serviceForm, type: serviceType });
      toast.success(data.message);
      setServiceType("");
      setServiceForm({ name: "", email: "", phone: "", company: "", deviceCount: "1", message: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send your request. Please try again.");
    } finally { setServiceSubmitting(false); }
  };
  useEffect(() => {
    Promise.all([productAPI.featured(), productAPI.list({ limit: 48 })])
      .then(([featuredResult, allResult]) => {
        setFeatured(featuredResult.data || []);
        setProducts(allResult.data?.products || []);
      })
      .catch(() => { setFeatured([]); setProducts([]); })
      .finally(() => setLoading(false));
  }, []);
  const brandCards = useMemo(() => brands.map((brand) => {
    const matching = products.filter((product) => product.brand === brand);
    return { brand, count: matching.length, image: matching[0]?.images?.[0] };
  }).filter((item) => item.count), [products]);
  const deals = useMemo(() => [...products].filter((p) => p.originalPrice > p.price).sort((a, b) => (b.originalPrice - b.price) / b.originalPrice - (a.originalPrice - a.price) / a.originalPrice).slice(0, 4), [products]);
  const priceRanges = useMemo(() => [
    { title: "Under ₹25,000", min: 0, max: 24999, note: "Everyday value" },
    { title: "₹25,000–₹50,000", min: 25000, max: 50000, note: "Work & study" },
    { title: "₹50,000–₹75,000", min: 50000, max: 75000, note: "More power" },
    { title: "Above ₹75,000", min: 75001, max: 250000, note: "Premium picks" },
  ].map((range) => {
    const matching = products.filter((product) => product.price >= range.min && product.price <= range.max);
    return { ...range, count: matching.length, image: matching[0]?.images?.[0] };
  }), [products]);

  return <div className="home-redesign">
    <section className="home-hero"><div className="container-page home-hero-grid"><div className="home-copy"><span className="home-kicker"><i /> CHECKED REFURBISHED TECH · 3-MONTH WARRANTY</span><h1>Better laptops.<br /><em>Smarter prices.</em></h1><p>Shop carefully graded laptops from Dell, Lenovo, HP, Apple and more. Every LappyShop refurbished laptop includes 30+ quality checks and a 3-month warranty.</p><div className="home-actions"><Link to="/shop" className="btn-accent">Shop laptops <FiArrowUpRight /></Link><Link to="/mobiles" className="home-secondary">Browse phones <FiArrowUpRight /></Link></div><div className="home-proof"><div className="proof-avatars"><span>✓</span><span>30+</span><span>↗</span></div><p><strong>Checked before it ships.</strong><br />Clear grades, condition notes and warranty.</p></div></div><div className="hero-product"><div className="hero-product-glow" /><div className="hero-laptop-visual" role="group" aria-label="Open silver LappyShop laptop with a rotating offers display"><div className="laptop-screen-frame"><span className="laptop-camera" /><div className="hero-laptop-screen"><HeroScreenCarousel /></div><span className="laptop-logo">LAPPYSHOP</span></div><div className="laptop-hinge" /><div className="laptop-base"><div className="laptop-keyboard">{KEYBOARD_ROWS.map((count, row) => <div className={`keyboard-row keyboard-row-${row + 1}`} key={row}>{Array.from({ length: count }, (_, key) => <span key={key} />)}</div>)}</div><div className="laptop-trackpad" /><div className="laptop-front-edge" /></div></div><div className="hero-floating-card"><span>LAPPYSHOP INSPECTED</span><strong>30+ quality checks</strong><small>3-month warranty included</small></div><div className="hero-side-note">GOOD TECH<br />GOES FURTHER <b>↗</b></div></div></div></section>

    <section className="container-page category-section"><div className="category-title"><div><span className="eyebrow">Shop by category</span><h2>Find the right laptop for you</h2></div><div className="browse-actions"><button type="button" onClick={() => scrollShelf(categoryScroller, -1)} aria-label="Previous categories"><FiChevronLeft /></button><button type="button" onClick={() => scrollShelf(categoryScroller, 1)} aria-label="More categories"><FiChevronRight /></button><Link to="/shop" className="text-link">All laptops <FiArrowUpRight /></Link></div></div><div className="category-grid browse-shelf" ref={categoryScroller}><Link to="/shop?category=Gaming" className="category-tile category-gaming"><span className="category-symbol"><FiMonitor /></span><strong>Gaming laptops</strong><small>Dedicated graphics and fast displays</small><FiArrowUpRight /></Link><Link to="/shop?category=Business" className="category-tile category-business"><span className="category-symbol"><FiBriefcase /></span><strong>Business laptops</strong><small>Dependable machines for work</small><FiArrowUpRight /></Link><Link to="/shop?category=2-in-1" className="category-tile category-2in1"><span className="category-symbol"><FiRefreshCw /></span><strong>2-in-1 laptops</strong><small>Flip from laptop to tablet</small><FiArrowUpRight /></Link><Link to="/shop?category=Chromebook" className="category-tile category-chromebook"><span className="category-symbol"><FiCpu /></span><strong>Chromebooks</strong><small>Simple laptops for everyday use</small><FiArrowUpRight /></Link><Link to="/shop?brand=Apple" className="category-tile category-mac"><span className="category-symbol"><FiCommand /></span><strong>Apple MacBooks</strong><small>MacBook Air and MacBook Pro</small><FiArrowUpRight /></Link><Link to="/mobiles" className="category-tile category-phone"><span className="category-symbol"><FiSmartphone /></span><strong>Phones marketplace</strong><small>Buy and sell new or used nearby</small><FiArrowUpRight /></Link></div></section>

    <section className="container-page brand-section"><div className="section-heading"><div><span className="eyebrow">Shop by brand</span><h2>Find your familiar favourite</h2><p>Choose a brand to see matching laptops in stock.</p></div><div className="browse-actions"><button type="button" onClick={() => scrollShelf(brandScroller, -1)} aria-label="Previous brands"><FiChevronLeft /></button><button type="button" onClick={() => scrollShelf(brandScroller, 1)} aria-label="More brands"><FiChevronRight /></button><Link to="/shop" className="text-link">All products <FiArrowUpRight /></Link></div></div>{brandCards.length > 0 && <div className="brand-grid browse-shelf" ref={brandScroller}>{brandCards.map(({ brand, count, image }) => <Link className="brand-card" key={brand} to={`/shop?brand=${encodeURIComponent(brand)}`}><img src={image} alt={`${brand} laptop`} loading="lazy" /><span className="brand-card-shade" /><span className="brand-card-name">{brand}</span><span className="brand-card-count">{count} {count === 1 ? "laptop" : "laptops"}</span><FiArrowUpRight /></Link>)}</div>}</section>

    <section className="container-page price-section"><div className="section-heading"><div><span className="eyebrow">Shop by price</span><h2>Good tech for your budget</h2><p>Choose a range to see laptops at that price.</p></div><div className="browse-actions"><button type="button" onClick={() => scrollShelf(priceScroller, -1)} aria-label="Previous price ranges"><FiChevronLeft /></button><button type="button" onClick={() => scrollShelf(priceScroller, 1)} aria-label="More price ranges"><FiChevronRight /></button><Link to="/shop" className="text-link">All laptops <FiArrowUpRight /></Link></div></div><div className="price-range-shelf browse-shelf" ref={priceScroller}>{priceRanges.map((range) => <Link key={range.title} to={`/shop?minPrice=${range.min}&maxPrice=${range.max}`} className="price-range-card"><img src={range.image || "/lappyshop-logo.png"} alt="" loading="lazy" /><span className="price-range-shade" /><span className="price-range-note">{range.note}</span><strong>{range.title}</strong><small>{range.count} {range.count === 1 ? "laptop" : "laptops"} <FiArrowUpRight /></small></Link>)}</div></section>

    <section className="container-page home-promises">{promises.map(({ icon: Icon, title, desc }, i) => <article key={title}><div className="promise-icon"><Icon /></div><div><span>0{i + 1}</span><h3>{title}</h3><p>{desc}</p></div></article>)}</section>

    <section className="home-featured container-page"><div className="section-heading"><div><span className="eyebrow">A good place to start</span><h2>Standout machines</h2><p>Handpicked laptops ready for their next chapter.</p></div><Link to="/shop" className="text-link">Browse the collection <FiArrowUpRight /></Link></div>{loading ? <Loader /> : featured.length ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{featured.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}</div> : <div className="featured-empty"><p>Our next collection is being prepared.</p><Link to="/shop" className="text-link">Explore the shop <FiArrowUpRight /></Link></div>}</section>

    <section className="deals-section"><div className="container-page"><div className="section-heading"><div><span className="eyebrow">Worth a closer look</span><h2>Special deals</h2><p>Reduced prices on selected refurbished laptops.</p></div><Link to="/shop" className="text-link">Shop all deals <FiArrowUpRight /></Link></div>{loading ? <Loader /> : deals.length ? <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{deals.map((p) => <ProductCard key={p._id} product={p} />)}</div> : <p className="deals-empty">New offers are on the way. <Link to="/shop">Browse laptops <FiArrowUpRight /></Link></p>}</div></section>

    <section className="service-section"><div className="container-page service-grid"><article className="service-card service-rent"><div className="service-card-content"><div className="service-icon"><FiMonitor /></div><span className="eyebrow">Flexible tech for your team</span><h2>Rent a laptop</h2><p>Need laptops for a project, event or growing team? Tell our sales team your timing and device needs.</p><button type="button" className="service-link" onClick={() => setServiceType("rental")}>Request rental options <FiArrowUpRight /></button></div><div className="service-card-photo"><img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85" alt="Laptop ready for work or study" loading="lazy" /><span>Flexible rental options</span></div></article><article className="service-card service-office"><div className="service-card-content"><div className="service-icon"><FiBriefcase /></div><span className="eyebrow">From one desk to a full floor</span><h2>Set up your office</h2><p>Share your team size and requirements. Our sales team can help plan a business laptop setup.</p><button type="button" className="service-link" onClick={() => setServiceType("office")}>Plan an office setup <FiArrowUpRight /></button></div><div className="service-card-photo"><img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85" alt="Bright modern office workspace" loading="lazy" /><span>Office-ready technology</span></div></article></div></section>

    <section className="refurb-section"><div className="container-page refurb-grid"><div className="refurb-intro"><span className="eyebrow">A smarter second life</span><h2>Refurbished gives you more confidence than “used”.</h2><p>“Used” can mean anything. A refurbished LappyShop laptop is inspected, graded and backed with a clear warranty.</p><Link to="/shop" className="btn-accent">Shop refurbished <FiArrowUpRight /></Link></div><div className="refurb-compare"><div className="compare-head"><span>What to expect</span><span>Refurbished at LappyShop</span></div><div><span>Quality checks</span><strong><FiCheck /> 30+ checks listed</strong></div><div><span>Condition</span><strong><FiCheck /> Clear grade and notes</strong></div><div><span>Warranty</span><strong><FiCheck /> 3 months included</strong></div><div><span>Trust</span><strong><FiCheck /> Seller and product details up front</strong></div><small>Marketplace phone listings may have seller-specific checks and terms; review each listing before purchase.</small></div></div></section>

    <section className="packaging-section"><div className="container-page packaging-grid"><div className="packaging-art" aria-label="Laptop and phone in LappyShop branded packaging"><div className="package-box laptop-package"><div className="package-logo"><img src="/lappyshop-logo.png" alt="LappyShop by Divine Technology" /></div><span>REFURBISHED LAPTOP</span></div><div className="package-box phone-package"><div className="package-logo"><img src="/lappyshop-logo.png" alt="LappyShop by Divine Technology" /></div><span>PRE-LOVED PHONE</span></div></div><div className="packaging-copy"><span className="eyebrow">Packed with care</span><h2>Good tech. A proper send-off.</h2><p>Laptops and phones are prepared for delivery in LappyShop-branded packaging, ready to travel safely to their next owner.</p><div className="packaging-points"><span><FiCheck /> Protective packing</span><span><FiCheck /> LappyShop branded box</span><span><FiCheck /> Ready for delivery</span></div></div></div></section>

    <section className="market-promo"><div className="container-page market-promo-inner"><div><span className="eyebrow">Give good tech another chapter</span><h2>Have a phone that’s<br />ready to move on?</h2><p>List it for free and connect with buyers in your city.</p></div><Link to="/mobiles#list-your-phone" className="btn-primary">Sell a phone <FiArrowUpRight /></Link></div></section>
    {serviceType && <div className="service-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setServiceType(""); }}><section className="service-request-modal" role="dialog" aria-modal="true" aria-labelledby="service-request-title"><button type="button" className="service-modal-close" onClick={() => setServiceType("")} aria-label="Close form"><FiX /></button><span className="eyebrow">Talk to our sales team</span><h2 id="service-request-title">{serviceType === "rental" ? "Laptop rental request" : "Office setup request"}</h2><p>Share a few details and LappyShop sales will follow up with options.</p><form onSubmit={submitServiceInquiry}><div className="service-request-grid"><label className="label">Your name<input className="input" required maxLength="100" value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} /></label><label className="label">Work email<input className="input" required type="email" maxLength="160" value={serviceForm.email} onChange={(event) => setServiceForm({ ...serviceForm, email: event.target.value })} /></label><label className="label">Phone number<input className="input" required type="tel" minLength="7" maxLength="24" value={serviceForm.phone} onChange={(event) => setServiceForm({ ...serviceForm, phone: event.target.value })} /></label><label className="label">Company / organization<input className="input" maxLength="120" value={serviceForm.company} onChange={(event) => setServiceForm({ ...serviceForm, company: event.target.value })} /></label><label className="label">Number of laptops<input className="input" required type="number" min="1" max="500" value={serviceForm.deviceCount} onChange={(event) => setServiceForm({ ...serviceForm, deviceCount: event.target.value })} /></label><label className="label service-request-message">What do you need?<textarea className="input" required minLength="10" maxLength="2000" rows="4" value={serviceForm.message} onChange={(event) => setServiceForm({ ...serviceForm, message: event.target.value })} placeholder={serviceType === "rental" ? "Tell us dates, duration and laptop requirements…" : "Tell us about your team and preferred specifications…"} /></label></div><button type="submit" disabled={serviceSubmitting} className="btn-primary w-full mt-5">{serviceSubmitting ? "Sending request…" : "Send to sales team"} <FiArrowUpRight /></button></form></section></div>}
  </div>;
}
