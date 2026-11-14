import mongoose from "mongoose";
const schema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "MobileListing", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 1500 },
    sentAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });
export default mongoose.model("MobileInquiry", schema);
