import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { productAPI, mobileAPI } from "../../api/endpoints";
import { discountPercent, formatPrice } from "../../utils/format";

const fallbackSlides = [
  {
    eyebrow: "DEAL OF THE WEEK · BUSINESS",
    title: "ThinkPad T14",
    detail: "16 GB · 512 GB SSD · Grade A",
    price: "₹32,000",
    originalPrice: "₹42,000",
    offer: "SAVE 24%",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=520&q=80",
    link: "/shop?category=Business",
    tone: "blue",
    kind: "laptop",
  },
  {
    eyebrow: "MACBOOK OFFER · CHECKED",
    title: "MacBook Air M1",
    detail: "8 GB · 256 GB SSD · Grade A",
    price: "₹62,000",
    originalPrice: "₹72,000",
    offer: "SAVE 14%",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=520&q=80",
    link: "/shop?brand=Apple",
    tone: "light",
    kind: "laptop",
  },
  {
    eyebrow: "PRE-LOVED PHONE · LIKE NEW",
    title: "Galaxy S23",
    detail: "256 GB · 95% battery · Bengaluru",
    price: "₹42,900",
    originalPrice: "₹54,900",
    offer: "SAVE 22%",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=520&q=80",
    link: "/mobiles",
    tone: "red",
    kind: "phone",
  },
];

export default function HeroScreenCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [slides, setSlides] = useState(fallbackSlides);

  useEffect(() => {
    Promise.all([productAPI.list({ limit: 48 }), mobileAPI.list({ limit: 24 })])
      .then(([laptopResult, mobileResult]) => {
        const laptops = laptopResult.data.products || [];
        const phones = mobileResult.data.listings || [];
        if (!laptops.length) return;

        const bestDeal = [...laptops].sort((a, b) => discountPercent(b.price, b.originalPrice) - discountPercent(a.price, a.originalPrice))[0];
        const mac = laptops.find((item) => item.brand === "Apple") || laptops[0];
        const makeLaptopSlide = (item, label, tone) => ({
          eyebrow: label,
          title: item.model || item.title,
          detail: `${item.brand} · ${item.specs?.ram || "Refurbished"} · ${item.specs?.storage || "Inspected"}`,
          price: formatPrice(item.price),
          originalPrice: item.originalPrice > item.price ? formatPrice(item.originalPrice) : "",
          offer: discountPercent(item.price, item.originalPrice) ? `SAVE ${discountPercent(item.price, item.originalPrice)}%` : "CHECKED & GRADED",
          image: item.images?.[0] || fallbackSlides[0].image,
          link: `/product/${item.slug || item._id}`,
          tone,
          kind: "laptop",
        });
        const phone = phones[0];
        const phoneSlide = phone ? {
          eyebrow: `${phone.condition.toUpperCase()} PHONE · ${phone.city.toUpperCase()}`,
          title: `${phone.brand} ${phone.model}`,
          detail: `${phone.storage || "Storage details"} · ${phone.batteryHealth || "Battery checked"}`,
          price: formatPrice(phone.price),
          originalPrice: phone.originalPrice > phone.price ? formatPrice(phone.originalPrice) : "",
          offer: phone.originalPrice > phone.price ? `SAVE ${discountPercent(phone.price, phone.originalPrice)}%` : "LOCAL LISTING",
          image: phone.images?.[0] || fallbackSlides[2].image,
          link: "/mobiles",
          tone: "red",
          kind: "phone",
        } : fallbackSlides[2];

        setSlides([
          makeLaptopSlide(bestDeal, `DEAL OF THE WEEK · ${bestDeal.category.toUpperCase()}`, "blue"),
          makeLaptopSlide(mac, "MACBOOK OFFER · CHECKED", "light"),
          phoneSlide,
        ]);
        setActive(0);
      })
      .catch(() => setSlides(fallbackSlides));
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 4200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const move = (direction) => setActive((index) => (index + direction + slides.length) % slides.length);

  return (
    <div
      className="hero-screen-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-live="off"
      aria-label="Featured offers carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(window.matchMedia("(prefers-reduced-motion: reduce)").matches)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }}
    >
      {slides.map((slide, index) => (
        <article className={`screen-slide screen-slide-${slide.tone} ${index === active ? "is-active" : ""}`} key={slide.eyebrow} aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`} aria-hidden={index !== active}>
          <div className="screen-slide-copy">
            <span className="screen-eyebrow">{slide.eyebrow}</span>
            <strong>{slide.title}</strong>
            <small>{slide.detail}</small>
            <span className="screen-price">{slide.price}{slide.originalPrice && <del>{slide.originalPrice}</del>}</span>
            <Link tabIndex={index === active ? 0 : -1} to={slide.link} className="screen-cta">{slide.kind === "phone" ? "View phone" : "View laptop"} <FiArrowRight /></Link>
          </div>
          <div className="screen-product-image"><img src={slide.image} alt="" className="screen-slide-image" />{slide.offer && <span className="screen-offer-badge">{slide.offer}</span>}</div>
        </article>
      ))}
      <div className="screen-carousel-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous offer"><FiArrowLeft /></button>
        <div className="screen-dots" role="group" aria-label="Choose an offer">
          {slides.map((slide, index) => <button type="button" key={slide.eyebrow} className={index === active ? "active" : ""} aria-label={`Show offer ${index + 1}`} aria-pressed={index === active} onClick={() => setActive(index)} />)}
        </div>
        <button type="button" onClick={() => move(1)} aria-label="Next offer"><FiArrowRight /></button>
      </div>
    </div>
  );
}
