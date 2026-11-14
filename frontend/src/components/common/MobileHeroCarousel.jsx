import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiChevronLeft, FiChevronRight, FiMapPin, FiSmartphone } from "react-icons/fi";
import { formatPrice } from "../../utils/format";

export default function MobileHeroCarousel({ listings = [] }) {
  const slides = useMemo(() => listings.filter((item) => item.images?.[0]).slice(0, 7), [listings]);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  useEffect(() => setActive(0), [slides.length]);
  useEffect(() => {
    if (slides.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) return undefined;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 4600);
    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  if (!slides.length) return <div className="mobile-carousel-stage is-loading" aria-label="Loading phone offers"><div className="mobile-carousel-placeholder"><FiSmartphone /><span>New and pre-loved phones</span></div></div>;

  const move = (direction) => setActive((index) => (index + direction + slides.length) % slides.length);
  const startTouch = (event) => { event.currentTarget.dataset.touchX = event.touches[0].clientX; };
  const endTouch = (event) => {
    const start = Number(event.currentTarget.dataset.touchX);
    const delta = event.changedTouches[0].clientX - start;
    if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1);
  };

  const handleKeys = (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
  };
  const releaseFocusPause = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  return <div className="mobile-carousel" role="region" aria-roledescription="carousel" aria-label="Featured phone offers" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={releaseFocusPause} onKeyDown={handleKeys}>
    <div className="mobile-carousel-stage" id="featured-phone-carousel" onTouchStart={startTouch} onTouchEnd={endTouch}>
      {slides.map((item, index) => {
        const offset = (index - active + slides.length) % slides.length;
        const relative = offset > slides.length / 2 ? offset - slides.length : offset;
        if (Math.abs(relative) > 2) return null;
        const isActive = relative === 0;
        const originalPrice = Number(item.originalPrice) || 0;
        const discount = originalPrice > item.price ? Math.round((1 - item.price / originalPrice) * 100) : null;
        return <Link
          key={item._id || item.title}
          to={`/mobiles#listing-${item._id}`}
          className={`hero-phone ${isActive ? "is-active" : ""} ${relative < 0 ? "is-left" : "is-right"}`}
          style={{ left: `calc(50% + ${relative * 145}px)`, zIndex: 5 - Math.abs(relative), opacity: Math.abs(relative) === 2 ? 0.38 : Math.abs(relative) === 1 ? 0.83 : 1 }}
          aria-label={`${item.title}, ${formatPrice(item.price)}`}
          aria-current={isActive ? "true" : undefined}
        >
          <div className="hero-phone-screen">
            <img src={item.images[0]} alt="" draggable="false" />
            <span className="hero-phone-glass" />
            <span className="hero-phone-camera" />
            <span className="hero-phone-offer">{discount ? `SAVE ${discount}%` : item.condition || "CHECKED"}</span>
            <span className="hero-phone-info"><small>{item.brand} · {item.condition}</small><strong>{item.title}</strong><b>{formatPrice(item.price)} {discount && <del>{formatPrice(originalPrice)}</del>}</b><em><FiMapPin /> {item.city || "Available now"}</em></span>
          </div>
          <span className="hero-phone-side-button" />
          <span className="hero-phone-bottom"><FiSmartphone /></span>
          {isActive && <span className="hero-phone-view">View phone <FiArrowUpRight /></span>}
        </Link>;
      })}
    </div>
    <div className="mobile-carousel-controls"><button type="button" onClick={() => move(-1)} aria-label="Previous phone" aria-controls="featured-phone-carousel"><FiChevronLeft /></button><div className="mobile-carousel-dots">{slides.map((item, index) => <button key={item._id || index} type="button" className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`Show phone ${index + 1}: ${item.title}`} aria-current={index === active ? "true" : undefined} />)}</div><span className="mobile-carousel-count">{String(active + 1).padStart(2, "0")} <i>/</i> {String(slides.length).padStart(2, "0")}</span><button type="button" onClick={() => move(1)} aria-label="Next phone" aria-controls="featured-phone-carousel"><FiChevronRight /></button></div>
  </div>;
}
