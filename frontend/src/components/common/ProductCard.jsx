import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import GradeBadge from "../common/GradeBadge";
import Rating from "../common/Rating";
import { formatPrice, discountPercent } from "../../utils/format";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const discount = discountPercent(product.price, product.originalPrice);
  const outOfStock = product.stock <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, 1);
    toast.success(`${product.title} added to cart`);
  };

  return (
    <Link to={`/product/${product.slug || product._id}`} className="group card border border-ink/10 overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-dim">
        <img
          src={product.images?.[0]}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2">
          <GradeBadge condition={product.condition} size="sm" />
        </div>
        <span className="absolute bottom-2 left-2 rounded-sm bg-white/95 px-2 py-1 text-[10px] font-bold text-[#176b49] shadow-sm">3 MONTH WARRANTY</span>
        {discount > 0 && (
          <span className="absolute top-2 right-2 rounded-xs bg-circuit text-paper text-xs font-bold px-2 py-1">
            -{discount}%
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
            <span className="text-paper font-mono text-xs uppercase tracking-widest">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="eyebrow">{product.brand}</span>
        <h3 className="mt-1 text-sm font-semibold text-ink leading-snug line-clamp-2">{product.title}</h3>
        <p className="mt-1 text-xs text-ink/50 line-clamp-1">
          {product.specs?.processor} · {product.specs?.ram} · {product.specs?.storage}
        </p>
        <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#176b49]"><span aria-hidden="true">✓</span> 30+ quality checks</p>

        <div className="mt-2">
          <Rating value={product.rating} count={product.numReviews} />
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <p className="font-display text-lg font-bold text-ink">{formatPrice(product.price)}</p>
            {discount > 0 && (
              <p className="text-xs text-ink/40 line-through">{formatPrice(product.originalPrice)}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="btn-primary !px-3 !py-2"
            aria-label="Add to cart"
          >
            <FiShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
