import asyncHandler from "express-async-handler";
import MobileListing from "../models/MobileListing.js";
import MobileInquiry from "../models/MobileInquiry.js";

export const listMobiles = asyncHandler(async (req, res) => {
  const filter = { status: "active" };
  if (req.query.keyword) filter.$text = { $search: String(req.query.keyword).slice(0, 80) };
  if (req.query.condition) filter.condition = req.query.condition;
  if (req.query.brand) filter.brand = String(req.query.brand).slice(0, 40);
  if (req.query.sellerType && ["store", "individual"].includes(req.query.sellerType)) filter.sellerType = req.query.sellerType;
  switch (String(req.query.category || "")) {
    case "iphone": filter.brand = "Apple"; break;
    case "android": filter.brand = { $ne: "Apple" }; break;
    case "new": filter.condition = { $in: ["New", "Like New"] }; break;
    case "stores": filter.sellerType = "store"; break;
    default: break;
  }
  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);
  if ((req.query.minPrice !== undefined && Number.isFinite(minPrice)) || (req.query.maxPrice !== undefined && Number.isFinite(maxPrice))) {
    filter.price = {};
    if (req.query.minPrice !== undefined && Number.isFinite(minPrice)) filter.price.$gte = Math.max(0, minPrice);
    if (req.query.maxPrice !== undefined && Number.isFinite(maxPrice)) filter.price.$lte = Math.max(0, maxPrice);
  }
  if (req.query.city) filter.city = { $regex: String(req.query.city).slice(0, 80), $options: "i" };
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));
  const [listings, total] = await Promise.all([
    MobileListing.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select("-sellerEmail -sellerPhone"),
    MobileListing.countDocuments(filter),
  ]);
  res.json({ listings, total, page, pages: Math.ceil(total / limit) });
});

export const createMobileListing = asyncHandler(async (req, res) => {
  const { title, brand, model, condition, price, originalPrice, storage, color, batteryHealth, description, images, city, sellerType, storeName, sellerPhone } = req.body;
  if (!title || !brand || !model || !condition || !description || !city || !sellerPhone || !sellerType || !Number.isFinite(Number(price)) || Number(price) < 1) {
    res.status(400); throw new Error("Please complete all required listing details.");
  }
  if (sellerType === "store" && !storeName?.trim()) { res.status(400); throw new Error("Store name is required for store listings."); }
  const safeImages = (Array.isArray(images) ? images : []).filter((url) => typeof url === "string" && /^https:\/\//i.test(url)).slice(0, 6);
  const listing = await MobileListing.create({ title, brand, model, condition, price: Number(price), originalPrice: Number(originalPrice) || 0, storage, color, batteryHealth, description, images: safeImages, city, sellerType, storeName, sellerName: req.user.name, sellerEmail: req.user.email, sellerPhone, owner: req.user._id, status: "pending" });
  res.status(201).json({ message: "Your listing was submitted for review.", listing: { _id: listing._id, status: listing.status } });
});

export const myMobileListings = asyncHandler(async (req, res) => {
  const listings = await MobileListing.find({ owner: req.user._id }).sort({ createdAt: -1 }).select("-sellerEmail -sellerPhone");
  res.json(listings);
});

export const createMobileInquiry = asyncHandler(async (req, res) => {
  const listing = await MobileListing.findOne({ _id: req.params.id, status: "active" });
  if (!listing) { res.status(404); throw new Error("This listing is no longer available."); }
  if (listing.owner.equals(req.user._id)) { res.status(400); throw new Error("You cannot inquire about your own listing."); }
  const message = String(req.body.message || "").trim();
  if (message.length < 8) { res.status(400); throw new Error("Please write a message of at least 8 characters."); }
  await MobileInquiry.create({ listing: listing._id, buyer: req.user._id, seller: listing.owner, messages: [{ sender: req.user._id, body: message }] });
  res.status(201).json({ message: "Your inquiry has been sent to the seller." });
});

export const getMobileInquiries = asyncHandler(async (req, res) => {
  const inquiries = await MobileInquiry.find({ $or: [{ seller: req.user._id }, { buyer: req.user._id }] }).populate("buyer", "name").populate("seller", "name").populate("messages.sender", "name").populate("listing", "title").sort({ updatedAt: -1 });
  res.json(inquiries);
});

export const replyMobileInquiry = asyncHandler(async (req, res) => {
  const inquiry = await MobileInquiry.findOne({ _id: req.params.id, $or: [{ buyer: req.user._id }, { seller: req.user._id }] });
  if (!inquiry) { res.status(404); throw new Error("Conversation not found."); }
  const body = String(req.body.message || "").trim();
  if (body.length < 2) { res.status(400); throw new Error("Please write a message."); }
  inquiry.messages.push({ sender: req.user._id, body });
  await inquiry.save();
  res.json({ message: "Reply sent." });
});

export const reviewMobileListings = asyncHandler(async (req, res) => {
  const listings = await MobileListing.find({ status: { $in: ["pending", "active"] } }).populate("owner", "name email").sort({ createdAt: -1 });
  res.json(listings);
});

export const setMobileListingStatus = asyncHandler(async (req, res) => {
  const allowed = ["active", "rejected", "sold"];
  if (!allowed.includes(req.body.status)) { res.status(400); throw new Error("Invalid listing status."); }
  const listing = await MobileListing.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!listing) { res.status(404); throw new Error("Listing not found."); }
  res.json({ message: `Listing marked ${listing.status}.`, listing });
});
