import { useState } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { productAPI } from "../../api/endpoints";

const BRANDS = ["Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "MSI", "Microsoft", "Samsung"];
const CATEGORIES = ["Business", "Gaming", "Ultrabook", "2-in-1", "Chromebook", "Workstation", "Budget"];
const CONDITIONS = ["Grade A - Like New", "Grade B - Good", "Grade C - Fair"];

const emptyForm = {
  title: "",
  brand: "Dell",
  model: "",
  description: "",
  condition: "Grade A - Like New",
  conditionNotes: "",
  category: "Business",
  price: "",
  originalPrice: "",
  stock: "",
  warrantyMonths: 3,
  isFeatured: false,
  isActive: true,
  specs: {
    processor: "",
    ram: "",
    storage: "",
    storageType: "SSD",
    display: "",
    graphics: "",
    os: "Windows 11 Pro",
    battery: "",
    weight: "",
  },
};

export default function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState(
    isEdit
      ? {
          ...emptyForm,
          ...product,
          specs: { ...emptyForm.specs, ...product.specs },
        }
      : emptyForm
  );
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setSpec = (key, value) => setForm((f) => ({ ...f, specs: { ...f.specs, [key]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("warrantyMonths", "3");
      Object.entries(form).forEach(([k, v]) => {
        if (k === "specs") fd.append("specs", JSON.stringify(v));
        else if (k !== "images" && k !== "_id" && k !== "reviews" && k !== "warrantyMonths" && v !== undefined) fd.append(k, v);
      });
      images.forEach((img) => fd.append("images", img));

      if (isEdit) {
        await productAPI.update(product._id, fd);
        toast.success("Product updated");
      } else {
        if (images.length === 0) {
          toast.error("Please upload at least one image");
          setSaving(false);
          return;
        }
        await productAPI.create(fd);
        toast.success("Product created");
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="card w-full max-w-2xl my-8 p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-ink/50 hover:text-ink">
          <FiX size={20} />
        </button>
        <h2 className="font-bold text-lg mb-4">{isEdit ? "Edit Product" : "Add New Product"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required value={form.title} onChange={(e) => setField("title", e.target.value)} className="input" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Brand</label>
              <select value={form.brand} onChange={(e) => setField("brand", e.target.value)} className="input">
                {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Model</label>
              <input required value={form.model} onChange={(e) => setField("model", e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => setField("category", e.target.value)} className="input">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} className="input" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Condition</label>
              <select value={form.condition} onChange={(e) => setField("condition", e.target.value)} className="input">
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Warranty</label>
              <input value="3 months (included)" readOnly className="input" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Price (₹)</label>
              <input required type="number" min="0" value={form.price} onChange={(e) => setField("price", e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Original Price (₹)</label>
              <input required type="number" min="0" value={form.originalPrice} onChange={(e) => setField("originalPrice", e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Stock Qty</label>
              <input required type="number" min="0" value={form.stock} onChange={(e) => setField("stock", e.target.value)} className="input" />
            </div>
          </div>

          <fieldset className="border border-ink/10 rounded-xs p-4">
            <legend className="label !mb-0 px-1">Specifications</legend>
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              <input placeholder="Processor" required value={form.specs.processor} onChange={(e) => setSpec("processor", e.target.value)} className="input" />
              <input placeholder="RAM (e.g. 16GB)" required value={form.specs.ram} onChange={(e) => setSpec("ram", e.target.value)} className="input" />
              <input placeholder="Storage (e.g. 512GB)" required value={form.specs.storage} onChange={(e) => setSpec("storage", e.target.value)} className="input" />
              <select value={form.specs.storageType} onChange={(e) => setSpec("storageType", e.target.value)} className="input">
                <option>SSD</option><option>HDD</option><option>SSD + HDD</option>
              </select>
              <input placeholder="Display" required value={form.specs.display} onChange={(e) => setSpec("display", e.target.value)} className="input" />
              <input placeholder="Graphics" required value={form.specs.graphics} onChange={(e) => setSpec("graphics", e.target.value)} className="input" />
              <input placeholder="OS" required value={form.specs.os} onChange={(e) => setSpec("os", e.target.value)} className="input" />
              <input placeholder="Battery" value={form.specs.battery} onChange={(e) => setSpec("battery", e.target.value)} className="input" />
            </div>
          </fieldset>

          <div>
            <label className="label">{isEdit ? "Add More Images (optional)" : "Product Images"}</label>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="input !py-2"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setField("isFeatured", e.target.checked)} className="accent-circuit" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setField("isActive", e.target.checked)} className="accent-circuit" />
              Active / Visible
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
            </button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
