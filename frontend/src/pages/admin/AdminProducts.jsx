import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { productAPI } from "../../api/endpoints";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import GradeBadge from "../../components/common/GradeBadge";
import ProductFormModal from "../../components/admin/ProductFormModal";
import { formatPrice } from "../../utils/format";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState(undefined); // undefined=closed, null=new, obj=edit

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productAPI
      .adminList({ page, keyword })
      .then(({ data }) => {
        setProducts(data.products);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [page, keyword]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    try {
      await productAPI.remove(product._id);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStockChange = async (product, newStock) => {
    if (newStock === "" || Number(newStock) < 0) return;
    try {
      await productAPI.updateStock(product._id, Number(newStock));
      setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, stock: Number(newStock) } : p)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setModalProduct(null)} className="btn-primary">
          <FiPlus /> Add Product
        </button>
      </div>

      <div className="relative max-w-sm mb-5">
        <input
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="input !pr-9"
        />
        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40" />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card border border-ink/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-xs text-ink/50 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="h-10 w-10 rounded-xs object-cover" />
                      <div>
                        <p className="font-medium line-clamp-1">{p.title}</p>
                        <p className="text-xs text-ink/40">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><GradeBadge condition={p.condition} size="sm" /></td>
                  <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      defaultValue={p.stock}
                      onBlur={(e) => handleStockChange(p, e.target.value)}
                      className="input !w-20 !py-1.5 !text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.isActive ? "text-grade-a bg-grade-a/10" : "text-ink/50 bg-ink/5"}`}>
                      {p.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModalProduct(p)} className="p-2 text-ink/60 hover:text-circuit" aria-label="Edit">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p)} className="p-2 text-ink/60 hover:text-red-600" aria-label="Delete">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-center py-10 text-ink/50 text-sm">No products found.</p>}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />

      {modalProduct !== undefined && (
        <ProductFormModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={() => {
            setModalProduct(undefined);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}
