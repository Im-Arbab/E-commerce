import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

// @desc    Get all products (search, filter, sort, paginate)
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  const filter = { isActive: true };

  if (req.query.keyword) {
    filter.$text = { $search: req.query.keyword };
  }
  if (req.query.brand) {
    filter.brand = { $in: req.query.brand.split(",") };
  }
  if (req.query.category) {
    filter.category = { $in: req.query.category.split(",") };
  }
  if (req.query.condition) {
    filter.condition = { $in: req.query.condition.split(",") };
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }
  if (req.query.inStock === "true") {
    filter.stock = { $gt: 0 };
  }

  let sort = { createdAt: -1 };
  switch (req.query.sort) {
    case "price_asc":
      sort = { price: 1 };
      break;
    case "price_desc":
      sort = { price: -1 };
      break;
    case "rating":
      sort = { rating: -1 };
      break;
    case "newest":
      sort = { createdAt: -1 };
      break;
    default:
      break;
  }

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get single product by id or slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

  const product = await Product.findOne(query);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

// @desc    Get featured products for homepage
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(8);
  res.json(products);
});

// @desc    Get distinct filter options (brands, categories, price range)
// @route   GET /api/products/filters
// @access  Public
export const getFilterOptions = asyncHandler(async (req, res) => {
  const [brands, categories, conditions] = await Promise.all([
    Product.distinct("brand", { isActive: true }),
    Product.distinct("category", { isActive: true }),
    Product.distinct("condition", { isActive: true }),
  ]);
  const priceStats = await Product.aggregate([
    { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
  ]);

  res.json({
    brands,
    categories,
    conditions,
    priceRange: priceStats[0] || { min: 0, max: 0 },
  });
});

// @desc    Create a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added" });
});

/* ------------------------- ADMIN ONLY BELOW ------------------------- */

// @desc    Get all products for admin (includes inactive, no pagination limit issues)
// @route   GET /api/products/admin/all
// @access  Private/Admin
export const getAdminProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;

  const filter = {};
  if (req.query.keyword) {
    filter.title = { $regex: req.query.keyword, $options: "i" };
  }

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const body = req.body;

  const images =
    req.files && req.files.length > 0
      ? req.files.map((f) => `/uploads/products/${f.filename}`)
      : body.images || [];

  if (!images.length) {
    res.status(400);
    throw new Error("At least one product image is required");
  }

  const product = new Product({
    ...body,
    specs: typeof body.specs === "string" ? JSON.parse(body.specs) : body.specs,
    images,
  });

  const created = await product.save();
  res.status(201).json(created);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const body = req.body;
  const newImages =
    req.files && req.files.length > 0
      ? req.files.map((f) => `/uploads/products/${f.filename}`)
      : null;

  Object.assign(product, {
    ...body,
    specs: body.specs
      ? typeof body.specs === "string"
        ? JSON.parse(body.specs)
        : body.specs
      : product.specs,
  });

  if (newImages) {
    product.images = [...product.images, ...newImages];
  } else if (body.images) {
    product.images = Array.isArray(body.images) ? body.images : [body.images];
  }

  const updated = await product.save();
  res.json(updated);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne();
  res.json({ message: "Product removed" });
});

// @desc    Update only stock quantity (dedicated stock-management endpoint)
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
export const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  if (stock === undefined || stock < 0) {
    res.status(400);
    throw new Error("Please provide a valid, non-negative stock value");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.stock = stock;
  await product.save();
  res.json({ message: "Stock updated", stock: product.stock });
});
