import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../utils/verifyUser.js";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { userid: true, firstName: true, lastName: true } } },
    });
    res.json({ success: true, reviews });
  } catch (err) {
    console.error("Fetch reviews error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const total = await prisma.review.count();
    const agg = await prisma.review.aggregate({ _avg: { rating: true } });
    const average = agg._avg.rating ? Number(agg._avg.rating.toFixed(2)) : 0;
    res.json({ success: true, summary: { total, average } });
  } catch (err) {
    console.error("Fetch review summary error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = Number(req.user.userid);
    const { rating, comment } = req.body;
    const r = rating ? Number(rating) : null;
    if (r !== null && (isNaN(r) || r < 1 || r > 5)) {
      return res.status(400).json({ success: false, message: "Rating must be an integer 1-5" });
    }

    const existing = await prisma.review.findUnique({ where: { userId } });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already submitted a review" });
    }

    const created = await prisma.review.create({
      data: {
        userId,
        rating: r,
        comment: comment ? String(comment) : null,
      },
      include: { user: { select: { userid: true, firstName: true, lastName: true } } },
    });

    res.json({ success: true, review: created });
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user.userid);
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    if (review.userId !== userId) return res.status(403).json({ success: false, message: "Forbidden" });
    await prisma.review.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
