import express from "express";
import {
  createCheckoutSession,
  getCheckoutSession,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// NOTE: the raw webhook route is mounted separately in server.js
// (it needs express.raw(), not express.json(), for Stripe signature verification)

router.post("/create-checkout-session", protect, createCheckoutSession);
router.get("/session/:sessionId", protect, getCheckoutSession);

export default router;
