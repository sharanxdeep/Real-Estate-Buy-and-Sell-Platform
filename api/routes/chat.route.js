import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../utils/verifyUser.js";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/conversations", verifyToken, async (req, res) => {
  try {
    console.log("POST /api/chat/conversations called. req.user:", req.user);
    const { propertyId, ownerId } = req.body;
    if (!propertyId || !ownerId) {
      return res.status(400).json({ success: false, message: "Missing propertyId or ownerId" });
    }

    const requesterId = Number(req.user.userid);
    if (!requesterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (Number(ownerId) === requesterId) {
      return res.status(400).json({ success: false, message: "Cannot chat with yourself" });
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        propertyId: Number(propertyId),
        ownerId: Number(ownerId),
        buyerId: requesterId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          propertyId: Number(propertyId),
          ownerId: Number(ownerId),
          buyerId: requesterId,
        },
      });
    }

    res.json({ success: true, conversation });
  } catch (err) {
    console.error("Conversation error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/:conversationId/messages", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = Number(req.user.userid);

    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(conversationId) },
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (conversation.buyerId !== userId && conversation.ownerId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: Number(conversationId) },
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/:conversationId/messages", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const userId = Number(req.user.userid);

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: "Empty message" });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(conversationId) },
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (conversation.buyerId !== userId && conversation.ownerId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: Number(conversationId),
        senderId: userId,
        text,
      },
    });

    res.json({ success: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/:conversationId/read", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = Number(req.user.userid);

    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(conversationId) },
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (conversation.buyerId !== userId && conversation.ownerId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const resMark = await prisma.message.updateMany({
      where: {
        conversationId: Number(conversationId),
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ success: true, updated: resMark.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
