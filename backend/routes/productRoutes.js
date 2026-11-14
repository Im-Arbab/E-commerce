import express from "express";
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getFilterOptions,
  createProductReview,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/filters", getFilterOptions);

// Admin (specific paths BEFORE the /:id catch-all)
router.get("/admin/all", protect, admin, getAdminProducts);
router.post("/", protect, admin, upload.array("images", 6), createProduct);
router.put("/:id", protect, admin, upload.array("images", 6), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.patch("/:id/stock", protect, admin, updateStock);

// Public detail + reviews (after admin/specific routes)
router.get("/:id", getProductById);
router.post("/:id/reviews", protect, createProductReview);

export default router;
