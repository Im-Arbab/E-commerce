import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// @desc    Create a Stripe Checkout session for an existing order
// @route   POST /api/payments/create-checkout-session
// @access  Private
export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized for this order");
  }
  if (order.isPaid) {
    res.status(400);
    throw new Error("Order is already paid");
  }

  const line_items = order.orderItems.map((item) => ({
    price_data: {
      currency: "inr",
      product_data: { name: item.title, images: [] },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.qty,
  }));

  // Add shipping + tax as a single combined line item for clarity
  const extra = order.shippingPrice + order.taxPrice;
  if (extra > 0) {
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Shipping & Tax" },
        unit_amount: Math.round(extra * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items,
    customer_email: req.user.email,
    success_url: `${process.env.CLIENT_URL}/order/${order._id}?payment=success`,
    cancel_url: `${process.env.CLIENT_URL}/order/${order._id}?payment=cancelled`,
    metadata: { orderId: order._id.toString() },
  });

  res.json({ url: session.url, sessionId: session.id });
});

// @desc    Stripe webhook — confirms payment and updates the order + stock
// @route   POST /api/payments/webhook
// @access  Public (verified via Stripe signature)
export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = "Processing";
        order.paymentResult = {
          id: session.id,
          status: session.payment_status,
          update_time: new Date().toISOString(),
          email_address: session.customer_email,
        };
        await order.save();

        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
        }
      }
    }
  }

  res.json({ received: true });
});

// @desc    Manually verify a session status (used by the success page as a fallback)
// @route   GET /api/payments/session/:sessionId
// @access  Private
export const getCheckoutSession = asyncHandler(async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
  res.json({ status: session.payment_status, metadata: session.metadata });
});
