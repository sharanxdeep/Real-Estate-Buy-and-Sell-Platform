import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import { verifyToken } from "../utils/verifyUser.js";

const prisma = new PrismaClient();
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/", verifyToken, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, price, status, category, locality, city, state, zipcode } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ success: false, message: "title, description and price are required" });
    }

    const parsedPrice = parseFloat(price);
    if (Number.isNaN(parsedPrice)) {
      return res.status(400).json({ success: false, message: "Invalid price" });
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        price: parsedPrice,
        status,
        category,
        ownerId: req.user.userid,
        address: {
          create: { locality, city, state, zipcode },
        },
        images: {
          create: (req.files || []).map((file) => ({
            imageUrl: `/uploads/${file.filename}`,
            imageName: file.originalname,
          })),
        },
      },
      include: {
        address: true,
        images: true,
        owner: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    res.json({ success: true, property });
  } catch (error) {
    console.error("Create property error:", error && (error.stack || error.message || error));
    res.status(500).json({ success: false, message: error?.message || "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        address: true,
        images: true,
        owner: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { propertyId: "desc" },
    });

    res.json({ success: true, properties });
  } catch (error) {
    console.error("Fetch properties error:", error && (error.stack || error.message || error));
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/search", async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) {
    return res.json({ success: true, properties: [] });
  }

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
        owner: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { propertyId: "desc" },
    });

    res.json({ success: true, properties });
  } catch (error) {
    console.error("Search error:", error && (error.stack || error.message || error));
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const propId = Number(req.params.id);
    if (Number.isNaN(propId)) return res.status(400).json({ success: false, message: "Invalid property id" });

    const userId = Number(req.user.userid);
    const { title, description, price, status, category, locality, city, state, zipcode } = req.body;

    const existing = await prisma.property.findUnique({ where: { propertyId: propId }, include: { address: true } });
    if (!existing) return res.status(404).json({ success: false, message: "Property not found" });
    if (Number(existing.ownerId) !== userId) return res.status(403).json({ success: false, message: "Forbidden" });

    let priceToSet = existing.price;
    if (price !== undefined && price !== null) {
      if (price === "") {
        priceToSet = existing.price;
      } else {
        const parsed = Number(price);
        if (Number.isNaN(parsed) || !isFinite(parsed) || parsed < 0) {
          return res.status(400).json({ success: false, message: "Invalid price" });
        }
        priceToSet = parsed;
      }
    }

    const updatedProperty = await prisma.property.update({
      where: { propertyId: propId },
      data: {
        title: title ?? existing.title,
        description: description ?? existing.description,
        price: priceToSet,
        status: status ?? existing.status,
        category: category ?? existing.category,
      },
      include: { address: true, images: true, owner: { select: { firstName: true, lastName: true, email: true } } },
    });

    try {
      await prisma.propertyAddress.upsert({
        where: { propertyId: propId },
        update: {
          locality: locality ?? existing.address?.locality ?? "",
          city: city ?? existing.address?.city ?? "",
          state: state ?? existing.address?.state ?? "",
          zipcode: zipcode ?? existing.address?.zipcode ?? "",
        },
        create: {
          propertyId: propId,
          locality: locality ?? "",
          city: city ?? "",
          state: state ?? "",
          zipcode: zipcode ?? "",
        },
      });
    } catch (addrErr) {
      console.error("Address upsert error:", addrErr && (addrErr.stack || addrErr.message || addrErr));
  
    }

    const fresh = await prisma.property.findUnique({
      where: { propertyId: propId },
      include: { address: true, images: true, owner: { select: { firstName: true, lastName: true, email: true } } },
    });

    res.json({ success: true, property: fresh });
  } catch (err) {
    console.error("Update property error:", err && (err.stack || err.message || err));
    res.status(500).json({ success: false, message: err?.message || "Internal server error" });
  }
});


router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const propId = Number(req.params.id);
    const userId = Number(req.user.userid);

    const existing = await prisma.property.findUnique({ where: { propertyId: propId } });
    if (!existing) return res.status(404).json({ success: false, message: "Property not found" });
    if (Number(existing.ownerId) !== userId) return res.status(403).json({ success: false, message: "Forbidden" });

    await prisma.property.delete({ where: { propertyId: propId } });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("Delete property error:", err && (err.stack || err.message || err));
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
