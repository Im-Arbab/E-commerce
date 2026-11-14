import express from "express";
import { createServiceInquiry, getServiceInquiries, updateServiceInquiryStatus } from "../controllers/serviceInquiryController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", createServiceInquiry);
router.get("/", protect, admin, getServiceInquiries);
router.patch("/:id/status", protect, admin, updateServiceInquiryStatus);
export default router;
