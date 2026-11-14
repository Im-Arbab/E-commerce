import mongoose from "mongoose";

const mobileListingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  brand: { type: String, required: true, trim: true, maxlength: 40 },
  model: { type: String, required: true, trim: true, maxlength: 80 },
  condition: { type: String, enum: ["New", "Like New", "Good", "Fair"], required: true },
  price: { type: Number, required: true, min: 1 },
  originalPrice: { type: Number, min: 0, default: 0 },
  storage: { type: String, trim: true, maxlength: 40 },
  color: { type: String, trim: true, maxlength: 40 },
  batteryHealth: { type: String, trim: true, maxlength: 40 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  images: [{ type: String, trim: true }],
  city: { type: String, required: true, trim: true, maxlength: 80 },
  sellerType: { type: String, enum: ["individual", "store"], required: true },
  storeName: { type: String, trim: true, maxlength: 100 },
  sellerName: { type: String, required: true, trim: true, maxlength: 100 },
  sellerEmail: { type: String, required: true, trim: true, lowercase: true },
  sellerPhone: { type: String, required: true, trim: true, maxlength: 20 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "active", "rejected", "sold"], default: "pending", index: true },
}, { timestamps: true });

mobileListingSchema.index({ title: "text", brand: "text", model: "text", description: "text", city: "text" });
export default mongoose.model("MobileListing", mobileListingSchema);
