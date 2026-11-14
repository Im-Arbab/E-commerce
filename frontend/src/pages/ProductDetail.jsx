import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiShoppingCart, FiCheck, FiTruck, FiShield } from "react-icons/fi";
import { productAPI } from "../api/endpoints";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import GradeBadge from "../components/common/GradeBadge";
import Rating from "../components/common/Rating";
import ProductCard from "../components/common/ProductCard";
import Loader from "../components/common/Loader";
import { formatPrice, discountPercent } from "../utils/format";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const load = () => {
    setLoading(true);
    productAPI
      .getOne(id)
      .then(({ data }) => {
        setProduct(data);
        setActiveImage(0);
        setQty(1);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    window.scrollTo(0, 0);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!product) return;
    const params = product.brand === "Apple"
      ? { brand: "Apple", category: product.category, limit: 8 }
      : { category: product.category, limit: 8 };
    productAPI.list(params)
      .then(({ data }) => setRelated(data.products.filter((item) => item._id !== product._id).slice(0, 4)))
      .catch(() => setRelated([]));
  }, [product?._id]);

  if (loading) return <Loader />;
  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-ink/60">Product not found.</p>
        <Link to="/shop" className="text-circuit-dark hover:underline text-sm">Back to shop</Link>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.originalPrice);
  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${qty} × ${product.title} added to cart`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to leave a review");
      return;
    }
    setSubmittingReview(true);
    try {
      await productAPI.review(product._id, reviewForm);
      toast.success("Review submitted");
      setReviewForm({ rating: 5, comment: "" });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container-page py-10">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-[4/3] rounded-xs overflow-hidden bg-paper-dim card border border-ink/10">
            <img src={product.images[activeImage]} alt={product.title} className="h-full w-full object-cover" />
          </div>
          <div className="mt-3 flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-16 w-16 rounded-xs overflow-hidden border-2 ${
                  activeImage === i ? "border-circuit" : "border-ink/10"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="eyebrow">{product.brand} · {product.category}</span>
          <h1 className="mt-1 text-2xl font-bold text-ink">{product.title}</h1>

          <div className="mt-2 flex items-center gap-3">
            <Rating value={product.rating} count={product.numReviews} />
            <GradeBadge condition={product.condition} withLabel size="sm" />
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="font-display text-3xl font-bold">{formatPrice(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-ink/40 line-through text-sm">{formatPrice(product.originalPrice)}</span>
                <span className="text-circuit-dark text-sm font-semibold">-{discount}%</span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm text-ink/70 leading-relaxed">{product.description}</p>

          <div className="mt-5 flex flex-wrap gap-4 text-xs text-ink/60">
            <span className="flex items-center gap-1.5"><FiShield className="text-circuit" /> 3-month LappyShop warranty</span>
            <span className="flex items-center gap-1.5"><FiTruck className="text-circuit" /> Free shipping over ₹50,000</span>
            <span className="flex items-center gap-1.5">
              <FiCheck className="text-circuit" /> {outOfStock ? "Out of stock" : `${product.stock} in stock`}
            </span>
          </div>

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-3">
              <select
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="input !w-20 !py-2.5"
              >
                {Array.from({ length: Math.min(product.stock, 5) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <button onClick={handleAddToCart} className="btn-primary flex-1">
                <FiShoppingCart /> Add to Cart
              </button>
            </div>
          )}
          {outOfStock && (
            <button disabled className="btn-primary mt-6 w-full opacity-50 cursor-not-allowed">
              Out of Stock
            </button>
          )}
        </div>
      </div>

      {/* Specs */}
      <section className="mt-14">
        <h2 className="text-lg font-bold mb-4">Specifications</h2>
        <div className="card border border-ink/10 divide-y divide-ink/10">
          {Object.entries({
            Processor: product.specs.processor,
            RAM: product.specs.ram,
            Storage: `${product.specs.storage} (${product.specs.storageType})`,
            Display: product.specs.display,
            Graphics: product.specs.graphics,
            "Operating System": product.specs.os,
            Battery: product.specs.battery,
            Weight: product.specs.weight,
            "Condition Notes": product.conditionNotes,
          }).map(([k, v]) =>
            v ? (
              <div key={k} className="flex justify-between px-5 py-3 text-sm">
                <span className="text-ink/50">{k}</span>
                <span className="font-medium text-ink text-right max-w-[60%]">{v}</span>
              </div>
            ) : null
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-14 max-w-2xl">
        <h2 className="text-lg font-bold mb-4">Customer Reviews ({product.numReviews})</h2>

        <div className="space-y-4 mb-8">
          {product.reviews.length === 0 && (
            <p className="text-sm text-ink/50">No reviews yet. Be the first to review this laptop.</p>
          )}
          {product.reviews.map((r) => (
            <div key={r._id} className="card border border-ink/10 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{r.name}</span>
                <Rating value={r.rating} />
              </div>
              <p className="mt-2 text-sm text-ink/70">{r.comment}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleReviewSubmit} className="card border border-ink/10 p-5 space-y-3">
          <h3 className="font-semibold text-sm">Write a review</h3>
          <div>
            <label className="label">Rating</label>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              className="input !w-32"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} Stars</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Comment</label>
            <textarea
              required
              rows={3}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="input"
              placeholder="Share your experience with this laptop..."
            />
          </div>
          <button type="submit" disabled={submittingReview} className="btn-primary">
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </section>

      {related.length > 0 && <section className="mt-16 border-t border-ink/10 pt-10">
        <div className="mb-6"><span className="eyebrow">Picked for you</span><h2 className="mt-1 text-2xl font-bold">More {product.brand === "Apple" ? "MacBooks" : product.category} laptops</h2></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{related.map((item) => <ProductCard key={item._id} product={item} />)}</div>
      </section>}
    </div>
  );
}
