import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productAPI } from "../api/endpoints";
import ProductCard from "../components/common/ProductCard";
import FilterSidebar from "../components/common/FilterSidebar";
import Loader from "../components/common/Loader";
import Pagination from "../components/common/Pagination";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState(null);

  const filters = Object.fromEntries(searchParams.entries());
  const page = Number(filters.page) || 1;
  const title = filters.keyword
    ? `Results for "${filters.keyword}"`
    : filters.category?.split(",").length === 1
      ? `${filters.category} Laptops`
      : filters.brand?.split(",").length === 1 && filters.brand === "Apple"
        ? "Apple MacBooks"
        : "All Laptops";

  useEffect(() => {
    productAPI.filters().then(({ data }) => setFilterOptions(data));
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productAPI
      .list({ ...filters, page })
      .then(({ data }) => {
        setProducts(data.products);
        setPages(data.pages);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <span className="eyebrow">Catalog</span>
        <h1 className="text-2xl font-bold mt-1">
          {title}
        </h1>
        <p className="text-sm text-ink/50 mt-1">{total} laptops found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          filterOptions={filterOptions}
          filters={filters}
          onChange={updateFilter}
          onClear={clearFilters}
        />

        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <select
              value={filters.sort || ""}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="input !w-auto !py-2 text-sm"
            >
              <option value="">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <div className="py-24 text-center text-ink/50">
              <p className="font-medium">No laptops match your filters.</p>
              <button onClick={clearFilters} className="mt-3 text-circuit-dark text-sm hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <Pagination page={page} pages={pages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
