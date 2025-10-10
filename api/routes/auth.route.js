import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
      select: { userid: true, firstName: true, lastName: true, email: true }
    });

    const token = jwt.sign({ userid: newUser.userid, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("access_token", token, { httpOnly: true, sameSite: "lax", secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ success: true, message: "Signup successful", user: newUser });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ success: false, message: "Incorrect password" });

    const token = jwt.sign({ userid: user.userid, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("access_token", token, { httpOnly: true, sameSite: "lax", secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ success: true, message: "Login successful", user: { userid: user.userid, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("access_token", { httpOnly: true, sameSite: "lax", secure: false })
    .json({ success: true, message: "Logged out successfully" });
});

export default router;
