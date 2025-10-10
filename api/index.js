import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import propertyRouter from "./routes/property.route.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/properties", propertyRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, statusCode, message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
