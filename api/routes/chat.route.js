import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyTokenOptional, verifyToken } from "../utils/verifyUser.js";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/conversations", verifyTokenOptional, async (req, res) => {
  try {
    const { propertyId, ownerId } = req.body;
    if (!propertyId || !ownerId) {
      return res.status(400).json({ success: false, message: "Missing propertyId or ownerId" });
    }

    const requesterId = req.user?.userid ? Number(req.user.userid) : null;

    let conversation;
    if (requesterId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          propertyId: Number(propertyId),
          ownerId: Number(ownerId),
          buyerId: requesterId,
        },
      });
    } else {
      conversation = await prisma.conversation.findFirst({
        where: {
          propertyId: Number(propertyId),
          ownerId: Number(ownerId),
          buyerId: null,
        },
      });
    }

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
    console.error("Create conversation error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/:conversationId/messages", verifyTokenOptional, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await prisma.message.findMany({
      where: { conversationId: Number(conversationId) },
      orderBy: { createdAt: "asc" },
    });

    const userId = req.user?.userid ? Number(req.user.userid) : null;
    const prepared = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      text: m.text,
      createdAt: m.createdAt,
      isMine: userId ? Number(m.senderId) === userId : false,
    }));

    res.json({ success: true, messages: prepared });
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/:conversationId/messages", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const senderId = req.user?.userid ? Number(req.user.userid) : null;
    if (!senderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!text || !String(text).trim()) {
      return res.status(400).json({ success: false, message: "Message text required" });
    }

    const msg = await prisma.message.create({
      data: {
        conversationId: Number(conversationId),
        senderId,
        text: String(text),
      },
    });

    const payload = {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      text: msg.text,
      createdAt: msg.createdAt,
    };

    if (globalThis.io) {
      globalThis.io.to(`conversation_${conversationId}`).emit("receive_message", { conversationId: Number(conversationId), message: payload });
    }

    const isMine = Number(msg.senderId) === senderId;
    res.json({ success: true, message: { ...payload, isMine } });
  } catch (err) {
    console.error("Create message error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
