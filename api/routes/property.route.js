import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../utils/verifyUser.js";
import multer from "multer";
import path from "path";

const prisma = new PrismaClient();
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/list", verifyToken, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, price, status, category, locality, city, state, zipcode } = req.body;
    if (!title || !description || !price || !status || !category || !locality || !city || !state || !zipcode) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newProperty = await prisma.property.create({
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
      },
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await prisma.propertyImage.create({
          data: {
            imageUrl: `/uploads/${file.filename}`,
            imageName: file.originalname,
            propertyId: newProperty.propertyId,
          },
        });
      }
    }

    res.json({ success: true, message: "Property listed successfully!" });
  } catch (err) {
    console.error("List property error:", err);
    res.status(500).json({ success: false, message: "Error listing property" });
  }
});

router.get("/", async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        address: true,
        images: true,
        owner: { select: { firstName: true, lastName: true } },
      },
      orderBy: { listedAt: "desc" },
    });

    res.json({ success: true, properties });
  } catch (err) {
    console.error("Fetch properties error:", err);
    res.status(500).json({ success: false, message: "Error fetching properties" });
  }
});

export default router;
