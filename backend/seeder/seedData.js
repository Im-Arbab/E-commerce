// Seeds the database with an admin user, a demo customer, and sample
// used-laptop products. Run with: npm run seed   (add -d to destroy all data)

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import MobileListing from "../models/MobileListing.js";
import Order from "../models/Order.js";

dotenv.config();

const users = [];
if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
  users.push({ name: "Store Admin", email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD, role: "admin" });
}
if (process.env.NODE_ENV !== "production") {
  users.push({ name: "Demo Customer", email: "customer@laptopstore.com", password: process.env.DEMO_CUSTOMER_PASSWORD || "customer123", role: "user" });
}

// Seed inventory contains more than 20 sample laptops across store categories.
const templates = [
  { brand: "Dell", model: "Latitude 5420", category: "Business", cpu: "Intel Core i5-1135G7", ram: "8GB", storage: "256GB", display: "14\" FHD", gpu: "Intel Iris Xe", base: 32000 },
  { brand: "Dell", model: "XPS 13 9310", category: "Ultrabook", cpu: "Intel Core i7-1165G7", ram: "16GB", storage: "512GB", display: "13.3\" FHD+", gpu: "Intel Iris Xe", base: 58000 },
  { brand: "Dell", model: "Inspiron 15 3511", category: "Budget", cpu: "Intel Core i3-1115G4", ram: "8GB", storage: "256GB", display: "15.6\" FHD", gpu: "Intel UHD", base: 21000 },
  { brand: "Dell", model: "Precision 5550", category: "Workstation", cpu: "Intel Core i7-10850H", ram: "32GB", storage: "1TB", display: "15.6\" 4K", gpu: "NVIDIA Quadro T2000", base: 89000 },
  { brand: "HP", model: "EliteBook 840 G7", category: "Business", cpu: "Intel Core i5-10310U", ram: "16GB", storage: "512GB", display: "14\" FHD", gpu: "Intel UHD", base: 38000 },
  { brand: "HP", model: "Pavilion 15", category: "Budget", cpu: "AMD Ryzen 5 5500U", ram: "8GB", storage: "512GB", display: "15.6\" FHD", gpu: "AMD Radeon", base: 26000 },
  { brand: "HP", model: "Spectre x360 13", category: "2-in-1", cpu: "Intel Core i7-1165G7", ram: "16GB", storage: "512GB", display: "13.3\" OLED Touch", gpu: "Intel Iris Xe", base: 62000 },
  { brand: "HP", model: "Omen 15", category: "Gaming", cpu: "Intel Core i7-10750H", ram: "16GB", storage: "512GB", display: "15.6\" FHD 144Hz", gpu: "NVIDIA RTX 2060", base: 68000 },
  { brand: "Lenovo", model: "ThinkPad T14 Gen 1", category: "Business", cpu: "AMD Ryzen 7 PRO 4750U", ram: "16GB", storage: "512GB", display: "14\" FHD", gpu: "AMD Radeon", base: 42000 },
  { brand: "Lenovo", model: "ThinkPad X1 Carbon Gen 8", category: "Ultrabook", cpu: "Intel Core i7-10510U", ram: "16GB", storage: "1TB", display: "14\" FHD", gpu: "Intel UHD", base: 55000 },
  { brand: "Lenovo", model: "IdeaPad Slim 3", category: "Budget", cpu: "AMD Ryzen 3 5300U", ram: "8GB", storage: "256GB", display: "15.6\" FHD", gpu: "AMD Radeon", base: 19000 },
  { brand: "Lenovo", model: "Legion 5", category: "Gaming", cpu: "AMD Ryzen 5 5600H", ram: "16GB", storage: "512GB", display: "15.6\" FHD 120Hz", gpu: "NVIDIA RTX 3060", base: 72000 },
  { brand: "Lenovo", model: "Yoga 9i", category: "2-in-1", cpu: "Intel Core i7-1165G7", ram: "16GB", storage: "512GB", display: "14\" 4K Touch", gpu: "Intel Iris Xe", base: 65000 },
  { brand: "Apple", model: "MacBook Air M1", category: "Ultrabook", cpu: "Apple M1", ram: "8GB", storage: "256GB", display: "13.3\" Retina", gpu: "Apple M1 GPU", base: 62000 },
  { brand: "Apple", model: "MacBook Pro 13 M1", category: "Ultrabook", cpu: "Apple M1", ram: "16GB", storage: "512GB", display: "13.3\" Retina", gpu: "Apple M1 GPU", base: 78000 },
  { brand: "Apple", model: "MacBook Pro 16 2019", category: "Workstation", cpu: "Intel Core i7-9750H", ram: "16GB", storage: "512GB", display: "16\" Retina", gpu: "AMD Radeon Pro 5300M", base: 105000 },
  { brand: "Asus", model: "ZenBook 14 UX425", category: "Ultrabook", cpu: "Intel Core i5-1135G7", ram: "8GB", storage: "512GB", display: "14\" FHD", gpu: "Intel Iris Xe", base: 41000 },
  { brand: "Asus", model: "VivoBook 15", category: "Budget", cpu: "Intel Core i3-1005G1", ram: "8GB", storage: "256GB", display: "15.6\" FHD", gpu: "Intel UHD", base: 20000 },
  { brand: "Asus", model: "ROG Strix G15", category: "Gaming", cpu: "AMD Ryzen 7 4800H", ram: "16GB", storage: "1TB", display: "15.6\" FHD 144Hz", gpu: "NVIDIA RTX 2070", base: 79000 },
  { brand: "Asus", model: "TUF Gaming F15", category: "Gaming", cpu: "Intel Core i5-10300H", ram: "16GB", storage: "512GB", display: "15.6\" FHD 144Hz", gpu: "NVIDIA GTX 1650", base: 49000 },
  { brand: "Acer", model: "Swift 3", category: "Ultrabook", cpu: "AMD Ryzen 5 4500U", ram: "8GB", storage: "512GB", display: "14\" FHD", gpu: "AMD Radeon", base: 33000 },
  { brand: "Acer", model: "Aspire 5", category: "Budget", cpu: "Intel Core i3-1115G4", ram: "8GB", storage: "256GB", display: "15.6\" FHD", gpu: "Intel UHD", base: 22000 },
  { brand: "Acer", model: "Predator Helios 300", category: "Gaming", cpu: "Intel Core i7-10750H", ram: "16GB", storage: "512GB", display: "15.6\" FHD 144Hz", gpu: "NVIDIA RTX 3060", base: 76000 },
  { brand: "Acer", model: "Spin 5", category: "2-in-1", cpu: "Intel Core i5-1135G7", ram: "8GB", storage: "512GB", display: "13.3\" FHD Touch", gpu: "Intel Iris Xe", base: 44000 },
  { brand: "MSI", model: "Modern 14", category: "Business", cpu: "Intel Core i5-1135G7", ram: "8GB", storage: "512GB", display: "14\" FHD", gpu: "Intel Iris Xe", base: 36000 },
  { brand: "MSI", model: "GF63 Thin", category: "Gaming", cpu: "Intel Core i5-10500H", ram: "8GB", storage: "512GB", display: "15.6\" FHD", gpu: "NVIDIA GTX 1650", base: 46000 },
  { brand: "MSI", model: "Stealth 15M", category: "Gaming", cpu: "Intel Core i7-11375H", ram: "16GB", storage: "512GB", display: "15.6\" FHD 144Hz", gpu: "NVIDIA RTX 3060", base: 82000 },
  { brand: "MSI", model: "Prestige 14", category: "Ultrabook", cpu: "Intel Core i7-1185G7", ram: "16GB", storage: "512GB", display: "14\" FHD", gpu: "Intel Iris Xe", base: 57000 },
  { brand: "Microsoft", model: "Surface Laptop 3", category: "Ultrabook", cpu: "Intel Core i5-1035G7", ram: "8GB", storage: "256GB", display: "13.5\" PixelSense", gpu: "Intel Iris Plus", base: 48000 },
  { brand: "Microsoft", model: "Surface Laptop 4", category: "Ultrabook", cpu: "AMD Ryzen 5 4680U", ram: "16GB", storage: "512GB", display: "13.5\" PixelSense", gpu: "AMD Radeon", base: 56000 },
  { brand: "Microsoft", model: "Surface Book 3", category: "2-in-1", cpu: "Intel Core i7-1065G7", ram: "16GB", storage: "512GB", display: "15\" PixelSense", gpu: "NVIDIA GTX 1660 Ti", base: 87000 },
  { brand: "Samsung", model: "Galaxy Book Pro", category: "Ultrabook", cpu: "Intel Core i5-1135G7", ram: "8GB", storage: "256GB", display: "13.3\" AMOLED", gpu: "Intel Iris Xe", base: 45000 },
  { brand: "Samsung", model: "Notebook 9 Pro", category: "2-in-1", cpu: "Intel Core i7-8565U", ram: "16GB", storage: "512GB", display: "13.3\" FHD Touch", gpu: "Intel UHD", base: 40000 },
  { brand: "Dell", model: "Latitude 7400", category: "Business", cpu: "Intel Core i7-8665U", ram: "16GB", storage: "512GB", display: "14\" FHD", gpu: "Intel UHD", base: 39000 },
  { brand: "HP", model: "ZBook Firefly 14", category: "Workstation", cpu: "Intel Core i7-10510U", ram: "16GB", storage: "512GB", display: "14\" FHD", gpu: "NVIDIA Quadro P520", base: 51000 },
  { brand: "Lenovo", model: "ThinkPad P15", category: "Workstation", cpu: "Intel Core i7-10850H", ram: "32GB", storage: "1TB", display: "15.6\" 4K", gpu: "NVIDIA Quadro RTX 3000", base: 97000 },
  { brand: "Asus", model: "ExpertBook B9", category: "Business", cpu: "Intel Core i7-1165G7", ram: "16GB", storage: "1TB", display: "14\" FHD", gpu: "Intel Iris Xe", base: 60000 },
  { brand: "Acer", model: "Nitro 5", category: "Gaming", cpu: "AMD Ryzen 5 5600H", ram: "8GB", storage: "512GB", display: "15.6\" FHD 144Hz", gpu: "NVIDIA GTX 1650", base: 43000 },
  { brand: "Dell", model: "Vostro 15 3510", category: "Budget", cpu: "Intel Core i5-1135G7", ram: "8GB", storage: "512GB", display: "15.6\" FHD", gpu: "Intel Iris Xe", base: 29000 },
  { brand: "MSI", model: "Katana GF66", category: "Gaming", cpu: "Intel Core i7-11800H", ram: "16GB", storage: "1TB", display: "15.6\" FHD 144Hz", gpu: "NVIDIA RTX 3050 Ti", base: 74000 },
  { brand: "Acer", model: "Chromebook Spin 514", category: "Chromebook", cpu: "AMD Ryzen 3 3250C", ram: "8GB", storage: "128GB", display: "14\" FHD Touch", gpu: "AMD Radeon", base: 28000 },
  { brand: "Lenovo", model: "Chromebook Flex 5", category: "Chromebook", cpu: "Intel Core i3-1115G4", ram: "8GB", storage: "128GB", display: "13.3\" FHD Touch", gpu: "Intel UHD", base: 31000 },
  { brand: "Asus", model: "Chromebook Flip CX5", category: "Chromebook", cpu: "Intel Core i3-1110G4", ram: "8GB", storage: "128GB", display: "14\" FHD Touch", gpu: "Intel UHD", base: 35000 },
  { brand: "HP", model: "Chromebook x360 14c", category: "Chromebook", cpu: "Intel Core i3-10110U", ram: "8GB", storage: "128GB", display: "14\" FHD Touch", gpu: "Intel UHD", base: 33000 },
];

const conditions = [
  { label: "Grade A - Like New", notes: "Minimal signs of use, screen and body in excellent condition, battery health 90%+.", discount: 0 },
  { label: "Grade B - Good", notes: "Light cosmetic wear (minor scuffs), fully functional, battery health 80%+.", discount: 0.12 },
  { label: "Grade C - Fair", notes: "Visible cosmetic wear, fully tested and functional, battery health 70%+.", discount: 0.22 },
];

const osFor = (brand) => (brand === "Apple" ? "macOS" : "Windows 11 Pro");

const laptopPhotos = {
  Gaming: ["photo-1593642702821-c8da6771f0c6", "photo-1593642632823-8f785ba67e45", "photo-1593642702749-b7d2a804fbcf"],
  Business: ["photo-1496181133206-80ce9b88a853", "photo-1588872657578-7efd1f1555ed", "photo-1517336714731-489689fd1ca8"],
  "2-in-1": ["photo-1588872657578-7efd1f1555ed", "photo-1496181133206-80ce9b88a853", "photo-1517336714731-489689fd1ca8"],
  Chromebook: ["photo-1588872657578-7efd1f1555ed", "photo-1496181133206-80ce9b88a853", "photo-1588872657578-7efd1f1555ed"],
  Apple: ["photo-1517336714731-489689fd1ca8", "photo-1496181133206-80ce9b88a853", "photo-1588872657578-7efd1f1555ed"],
  default: ["photo-1496181133206-80ce9b88a853", "photo-1517336714731-489689fd1ca8", "photo-1588872657578-7efd1f1555ed"],
};

const imageUrl = (photo, width = 1000) => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=82`;

const buildProducts = () =>
  templates.map((t, i) => {
    const cond = conditions[i % conditions.length];
    const price = Math.round((t.base * (1 - cond.discount)) / 100) * 100;
    const stock = [0, 2, 3, 5, 7, 10][i % 6];
    return {
      title: `${t.brand} ${t.model} (Refurbished)`,
      brand: t.brand,
      model: t.model,
      description: `Refurbished ${t.brand} ${t.model} featuring a ${t.cpu} processor, ${t.ram} RAM and ${t.storage} storage. Professionally inspected, tested across 30+ quality checks, and backed by a 3-month warranty. ${cond.notes}`,
      condition: cond.label,
      conditionNotes: cond.notes,
      specs: {
        processor: t.cpu,
        ram: t.ram,
        storage: t.storage,
        storageType: "SSD",
        display: t.display,
        graphics: t.gpu,
        os: osFor(t.brand),
        battery: "Up to 8 hours (varies with use)",
        weight: "1.3 - 2.1 kg",
        ports: ["USB-A", "USB-C", "HDMI", "3.5mm Audio Jack"],
      },
      images: (laptopPhotos[t.brand === "Apple" ? "Apple" : t.category] || laptopPhotos.default).map((photo) => imageUrl(photo)),
      price,
      originalPrice: t.base,
      warrantyMonths: 3,
      category: t.category,
      stock,
      rating: Math.round((3.5 + ((i % 15) / 10)) * 10) / 10,
      numReviews: (i * 3) % 27,
      isFeatured: i % 5 === 0,
      isActive: true,
    };
  });

const mobileModels = [
  ["Apple", "iPhone 13", 38900, "Like New", "128 GB", "91%"], ["Apple", "iPhone 14", 48900, "Good", "128 GB", "88%"],
  ["Apple", "iPhone 12", 29900, "Good", "128 GB", "84%"], ["Apple", "iPhone 13 mini", 34900, "Like New", "128 GB", "90%"],
  ["Apple", "iPhone 14 Pro", 68900, "Like New", "256 GB", "91%"], ["Apple", "iPhone SE (2022)", 21900, "Good", "64 GB", "86%"],
  ["Samsung", "Galaxy S23", 42900, "Like New", "256 GB", "95%"], ["Samsung", "Galaxy S22", 28900, "Good", "128 GB", "87%"],
  ["Samsung", "Galaxy A54 5G", 18900, "Good", "128 GB", "92%"], ["Samsung", "Galaxy Z Flip4", 35900, "Fair", "128 GB", "83%"],
  ["Google", "Pixel 8", 39900, "Like New", "128 GB", "96%"], ["Google", "Pixel 7", 25900, "Good", "128 GB", "88%"],
  ["OnePlus", "OnePlus 11", 32900, "Like New", "256 GB", "93%"], ["OnePlus", "OnePlus 10 Pro", 24900, "Good", "128 GB", "86%"],
  ["Nothing", "Phone (2)", 27900, "Good", "256 GB", "90%"], ["Xiaomi", "Xiaomi 13", 31900, "Like New", "256 GB", "94%"],
  ["Motorola", "Edge 40", 19900, "Good", "256 GB", "89%"], ["Realme", "GT 2 Pro", 20900, "Fair", "128 GB", "81%"],
  ["Samsung", "Galaxy S21 FE", 17900, "Good", "128 GB", "85%"], ["Apple", "iPhone 15", 64900, "New", "128 GB", "100%"],
];
const mobilePhotos = ["photo-1511707171634-5f897ff02aa9", "photo-1598327105666-5b89351aff97", "photo-1592899677977-9c10ca588bbd", "photo-1512499617640-c74ae3a79d37"];
const buildMobiles = (owner) => mobileModels.map(([brand, model, price, condition, storage, batteryHealth], index) => ({
  title: `${brand} ${model} (${condition})`, brand, model, price, originalPrice: Math.round(price * 1.2), condition, storage, batteryHealth,
  color: ["Midnight", "Silver", "Graphite", "Blue"][index % 4],
  description: `${condition === "New" ? "Brand new" : "Pre-owned and checked"} ${brand} ${model} with ${storage} storage. ${batteryHealth} battery health, clean IMEI, and tested cameras, speakers, charging and display. Sample marketplace listing for demonstration.`,
  images: [imageUrl(mobilePhotos[index % mobilePhotos.length], 900)], city: ["Mumbai", "Bengaluru", "Delhi", "Pune", "Hyderabad"][index % 5],
  sellerType: index % 3 === 0 ? "store" : "individual", storeName: index % 3 === 0 ? "ReTech Mobile Hub" : "", sellerName: index % 3 === 0 ? "ReTech Mobile Hub" : owner.name,
  sellerEmail: owner.email, sellerPhone: "0000000000", owner: owner._id, status: "active",
}));

const importData = async () => {
  try {
    await connectDB();

    for (const account of users) {
      if (!(await User.exists({ email: account.email }))) await User.create(account);
    }
    let seededCount = 0;
    let refreshedCount = 0;
    for (const item of buildProducts()) {
      const existing = await Product.findOne({ brand: item.brand, model: item.model });
      if (!existing) {
        await Product.create(item);
        seededCount += 1;
      } else if (existing.title.includes("(Refurbished)")) {
        existing.images = item.images;
        existing.warrantyMonths = 3;
        existing.description = item.description;
        await existing.save();
        refreshedCount += 1;
      }
    }

    const seedOwner = await User.findOne({ role: "admin" }) || await User.findOne({ role: "user" });
    let seededMobiles = 0;
    if (seedOwner) {
      for (const item of buildMobiles(seedOwner)) {
        if (!(await MobileListing.exists({ brand: item.brand, model: item.model, owner: seedOwner._id }))) {
          await MobileListing.create(item);
          seededMobiles += 1;
        }
      }
    }

    console.log(`Seed complete: ${seededCount} laptops and ${seededMobiles} phones added; ${refreshedCount} sample laptops refreshed.`);
    console.log("Other users, products, and orders were preserved.");
    process.exit();
  } catch (error) {
    console.error(`Seeder error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log("All data destroyed.");
    process.exit();
  } catch (error) {
    console.error(`Seeder error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
