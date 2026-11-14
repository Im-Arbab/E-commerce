import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    brand: {
      type: String,
      required: true,
      enum: ["Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "MSI", "Microsoft", "Samsung"],
    },
    model: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },

    // Condition grading — real domain concept for a used-laptop marketplace
    condition: {
      type: String,
      required: true,
      enum: ["Grade A - Like New", "Grade B - Good", "Grade C - Fair"],
    },
    conditionNotes: { type: String },

    // Specs
    specs: {
      processor: { type: String, required: true },
      ram: { type: String, required: true },
      storage: { type: String, required: true },
      storageType: { type: String, enum: ["SSD", "HDD", "SSD + HDD"], default: "SSD" },
      display: { type: String, required: true },
      graphics: { type: String, required: true },
      os: { type: String, required: true },
      battery: { type: String },
      weight: { type: String },
      ports: [{ type: String }],
    },

    images: [{ type: String, required: true }],

    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    warrantyMonths: { type: Number, default: 3, min: 3, max: 3 },

    category: {
      type: String,
      enum: ["Business", "Gaming", "Ultrabook", "2-in-1", "Chromebook", "Workstation", "Budget"],
      default: "Business",
    },

    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true },

    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", brand: "text", model: "text", description: "text" });

productSchema.pre("save", function (next) {
  if (!this.sku) {
    this.sku = `LT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
  }
  if (this.isModified("title") || !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Math.random().toString(36).slice(2, 7);
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
