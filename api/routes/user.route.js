import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { verifyToken } from "../utils/verifyUser.js";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userid: req.user.userid },
      select: { userid: true, firstName: true, lastName: true, email: true }
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/update", verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const dataToUpdate = { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(email && { email }) };
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { userid: req.user.userid },
      data: dataToUpdate,
      select: { userid: true, firstName: true, lastName: true, email: true }
    });

    res.json({ success: true, message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/delete", verifyToken, async (req, res) => {
  try {
    await prisma.user.delete({ where: { userid: req.user.userid } });
    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
