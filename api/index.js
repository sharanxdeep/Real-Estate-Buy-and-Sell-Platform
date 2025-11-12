import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import propertyRoutes from "./routes/property.route.js";
import chatRoutes from "./routes/chat.route.js";
import reviewRoutes from "./routes/review.route.js";

dotenv.config();
const prisma = new PrismaClient();
const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/property", propertyRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("SafeRoof backend is running...");
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});
globalThis.io = io;

io.on("connection", (socket) => {
  socket.on("join_conversation", ({ conversationId }) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on("leave_conversation", ({ conversationId }) => {
    socket.leave(`conversation_${conversationId}`);
  });

  socket.on("disconnect", () => {});
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
