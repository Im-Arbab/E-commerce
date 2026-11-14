import mongoose from "mongoose";

const serviceInquirySchema = new mongoose.Schema({
  type: { type: String, enum: ["rental", "office"], required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  phone: { type: String, required: true, trim: true, maxlength: 24 },
  company: { type: String, trim: true, maxlength: 120 },
  deviceCount: { type: Number, min: 1, max: 500, default: 1 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ["new", "contacted", "closed"], default: "new", index: true },
}, { timestamps: true });

export default mongoose.model("ServiceInquiry", serviceInquirySchema);
