const CATEGORIES = ["Business", "Gaming", "Ultrabook", "2-in-1", "Chromebook", "Workstation", "Budget"];
const CONDITIONS = ["Grade A - Like New", "Grade B - Good", "Grade C - Fair"];

export default function FilterSidebar({ filterOptions, filters, onChange, onClear }) {
  const brands = filterOptions?.brands || [];
  const categories = filterOptions?.categories?.length ? filterOptions.categories : CATEGORIES;

  const toggleMulti = (key, value) => {
    const current = filters[key] ? filters[key].split(",") : [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange(key, next.join(","));
  };

  const isChecked = (key, value) => (filters[key] || "").split(",").includes(value);

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm">Filters</h3>
        <button onClick={onClear} className="text-xs text-circuit-dark hover:underline">
          Clear all
        </button>
      </div>

      <div>
        <p className="label">Brand</p>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm text-ink/80 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked("brand", b)}
                onChange={() => toggleMulti("brand", b)}
                className="accent-circuit"
              />
              {b}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="label">Category</p>
        <div className="space-y-1.5">
          {categories.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-ink/80 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked("category", c)}
                onChange={() => toggleMulti("category", c)}
                className="accent-circuit"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="label">Condition</p>
        <div className="space-y-1.5">
          {CONDITIONS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-ink/80 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked("condition", c)}
                onChange={() => toggleMulti("condition", c)}
                className="accent-circuit"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="label">Price Range (₹)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => onChange("minPrice", e.target.value)}
            className="input !py-1.5 !text-xs"
          />
          <span className="text-ink/30">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => onChange("maxPrice", e.target.value)}
            className="input !py-1.5 !text-xs"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/80 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.inStock === "true"}
          onChange={(e) => onChange("inStock", e.target.checked ? "true" : "")}
          className="accent-circuit"
        />
        In stock only
      </label>
    </aside>
  );
}
