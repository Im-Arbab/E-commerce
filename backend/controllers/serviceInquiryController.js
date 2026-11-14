import asyncHandler from "express-async-handler";
import ServiceInquiry from "../models/ServiceInquiry.js";

export const createServiceInquiry = asyncHandler(async (req, res) => {
  const { type, name, email, phone, company, deviceCount, message } = req.body;
  const safeType = String(type || "");
  const safeName = String(name || "").trim();
  const safeEmail = String(email || "").trim().toLowerCase();
  const safePhone = String(phone || "").trim();
  const safeMessage = String(message || "").trim();
  const count = Number(deviceCount || 1);
  if (!["rental", "office"].includes(safeType) || safeName.length < 2 || safeName.length > 100 || !/^\S+@\S+\.\S+$/.test(safeEmail) || safeEmail.length > 160 || safePhone.length < 7 || safePhone.length > 24 || safeMessage.length < 10 || safeMessage.length > 2000 || !Number.isInteger(count) || count < 1 || count > 500) {
    res.status(400);
    throw new Error("Please check your contact details and request information.");
  }
  const inquiry = await ServiceInquiry.create({ type: safeType, name: safeName, email: safeEmail, phone: safePhone, company: String(company || "").trim().slice(0, 120), deviceCount: count, message: safeMessage });
  res.status(201).json({ message: "Your request has been sent to our sales team.", inquiryId: inquiry._id });
});

export const getServiceInquiries = asyncHandler(async (_req, res) => {
  const inquiries = await ServiceInquiry.find().sort({ createdAt: -1 }).limit(500);
  res.json(inquiries);
});

export const updateServiceInquiryStatus = asyncHandler(async (req, res) => {
  const allowed = ["new", "contacted", "closed"];
  if (!allowed.includes(req.body.status)) { res.status(400); throw new Error("Invalid inquiry status."); }
  const inquiry = await ServiceInquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!inquiry) { res.status(404); throw new Error("Service request not found."); }
  res.json(inquiry);
});
