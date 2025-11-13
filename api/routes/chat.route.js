import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken, verifyTokenOptional } from "../utils/verifyUser.js";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/conversations", verifyToken, async (req, res) => {
  try {
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
    console.error("Conversation error:", err && (err.stack || err.message || err));
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/conversations", verifyToken, async (req, res) => {
  try {
    const userId = Number(req.user.userid);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ ownerId: userId }, { buyerId: userId }],
      },
      orderBy: { createdAt: "desc" },
    });

    const out = await Promise.all(
      conversations.map(async (c) => {
        const lastMsg = await prisma.message.findFirst({
          where: { conversationId: c.id },
          orderBy: { createdAt: "desc" },
        });

        const ownerUser = await prisma.user.findUnique({
          where: { userid: c.ownerId },
          select: { userid: true, firstName: true, lastName: true, email: true },
        });

        const buyerUser = c.buyerId
          ? await prisma.user.findUnique({
              where: { userid: c.buyerId },
              select: { userid: true, firstName: true, lastName: true, email: true },
            })
          : null;

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: c.id,
            read: false,
            senderId: { not: userId },
          },
        });

        const property = await prisma.property.findUnique({
          where: { propertyId: c.propertyId },
          select: { propertyId: true, title: true },
        });

        return {
          id: c.id,
          propertyId: c.propertyId,
          ownerId: c.ownerId,
          buyerId: c.buyerId,
          lastMessage: lastMsg,
          ownerUser,
          buyerUser,
          unreadCount,
          property,
        };
      })
    );

    res.json({ success: true, conversations: out });
  } catch (err) {
    console.error("Fetch conversations error:", err && (err.stack || err.message || err));
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/:conversationId/messages", verifyTokenOptional, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversationIdNum = Number(conversationId);
    if (Number.isNaN(conversationIdNum)) return res.status(400).json({ success: false, message: "Invalid conversation id" });

    const messages = await prisma.message.findMany({
      where: { conversationId: conversationIdNum },
      orderBy: { createdAt: "asc" },
    });

    const userId = req.user?.userid ? Number(req.user.userid) : null;

    if (userId) {
      await prisma.message.updateMany({
        where: {
          conversationId: conversationIdNum,
          senderId: { not: userId },
          read: false,
        },
        data: { read: true },
      });

      if (globalThis.io) {
        globalThis.io.to(`conversation_${conversationIdNum}`).emit("messages_read", {
          conversationId: conversationIdNum,
          readerId: userId,
        });
      }
    }

    const prepared = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      text: m.text,
      createdAt: m.createdAt,
      isMine: userId ? Number(m.senderId) === userId : false,
      read: !!m.read,
    }));

    res.json({ success: true, messages: prepared });
  } catch (err) {
    console.error("Fetch messages error:", err && (err.stack || err.message || err));
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/:conversationId/messages", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const senderId = req.user?.userid ? Number(req.user.userid) : null;
    if (!senderId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!text || !String(text).trim()) return res.status(400).json({ success: false, message: "Message text required" });

    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(conversationId) },
    });

    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });
    if (conversation.buyerId !== senderId && conversation.ownerId !== senderId) return res.status(403).json({ success: false, message: "Forbidden" });

    const msg = await prisma.message.create({
      data: {
        conversationId: Number(conversationId),
        senderId,
        text: String(text),
        read: false,
      },
    });

    const payload = {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      text: msg.text,
      createdAt: msg.createdAt,
      read: msg.read,
    };

    if (globalThis.io) {
      globalThis.io.to(`conversation_${conversationId}`).emit("receive_message", { conversationId: Number(conversationId), message: payload });
    }

    const isMine = Number(msg.senderId) === senderId;
    res.json({ success: true, message: { ...payload, isMine } });
  } catch (err) {
    console.error("Create message error:", err && (err.stack || err.message || err));
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

    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });
    if (conversation.buyerId !== userId && conversation.ownerId !== userId) return res.status(403).json({ success: false, message: "Forbidden" });

    const resMark = await prisma.message.updateMany({
      where: {
        conversationId: Number(conversationId),
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    if (globalThis.io) {
      globalThis.io.to(`conversation_${Number(conversationId)}`).emit("messages_read", { conversationId: Number(conversationId), readerId: userId });
    }

    res.json({ success: true, updated: resMark.count });
  } catch (err) {
    console.error("Mark read error:", err && (err.stack || err.message || err));
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/conversations/:conversationId", verifyToken, async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    if (Number.isNaN(conversationId)) return res.status(400).json({ success: false, message: "Invalid conversation id" });

    const userId = Number(req.user.userid);
    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) return res.status(404).json({ success: false, message: "Conversation not found" });
    if (conv.ownerId !== userId && conv.buyerId !== userId) return res.status(403).json({ success: false, message: "Forbidden" });

    await prisma.message.deleteMany({ where: { conversationId } });
    await prisma.conversation.delete({ where: { id: conversationId } });

    if (globalThis.io) {
      globalThis.io.to(`conversation_${conversationId}`).emit("conversation_deleted", { conversationId });
    }

    res.json({ success: true, message: "Conversation deleted" });
  } catch (err) {
    console.error("Delete conversation error:", err && (err.stack || err.message || err));
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
