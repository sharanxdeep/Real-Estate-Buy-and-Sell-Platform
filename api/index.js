import userRouter from "./routes/user.route.js";
import express from "express";
import authRouter from "./routes/auth.route.js";

const app = express();
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
