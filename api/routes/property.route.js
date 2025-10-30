import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import { verifyToken } from "../utils/verifyUser.js";

const prisma = new PrismaClient();
const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ Create property
router.post("/", verifyToken, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, price, status, category, locality, city, state, zipcode } = req.body;

    const property = await prisma.property.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        status,
        category,
        ownerId: req.user.userid,
        address: {
          create: { locality, city, state, zipcode },
        },
        images: {
          create: req.files.map((file) => ({
            imageUrl: `/uploads/${file.filename}`,
            imageName: file.originalname,
          })),
        },
      },
      include: { address: true, images: true },
    });

    res.json({ success: true, property });
  } catch (error) {
    console.error("Create property error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ✅ Get all properties (Home Page)
router.get("/", async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        address: true,
        images: true,
      },
      orderBy: { propertyId: "desc" },
    });

    res.json({ success: true, properties });
  } catch (error) {
    console.error("Fetch properties error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ✅ Search properties (title, category, city, description)
// ✅ Search properties by title, description, category, or city
// ✅ Fixed search route (handles nested address relations safely)
// ✅ Fixed Search Route (compatible with MySQL)
router.get("/search", async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) return res.json({ success: true, properties: [] });

  try {
    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { category: { contains: query } },
          {
            address: {
              city: { contains: query },
            },
          },
        ],
      },
      include: {
        address: true,
        images: true,
      },
      orderBy: { propertyId: "desc" },
    });

    res.json({ success: true, properties });
  } catch (error) {
    console.error("❌ Search error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Internal server error" });
  }
});




export default router;
