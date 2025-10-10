import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ success: false, message: "Invalid or expired token" });
      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error("verifyToken error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
