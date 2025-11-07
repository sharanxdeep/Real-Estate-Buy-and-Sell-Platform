import express from "express";
const router = express.Router();

router.get("/cookies", (req, res) => {
  res.json({ cookiesHeader: req.headers.cookie || null, parsed: req.cookies || {} });
});

export default router;
