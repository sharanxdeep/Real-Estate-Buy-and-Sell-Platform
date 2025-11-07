import jwt from "jsonwebtoken";

function parseCookieString(cookieString) {
  if (!cookieString) return {};
  return cookieString.split(";").reduce((acc, pair) => {
    const [rawName, ...rawVal] = pair.split("=");
    if (!rawName) return acc;
    const name = rawName.trim();
    const value = rawVal.join("=").trim();
    acc[name] = decodeURIComponent(value);
    return acc;
  }, {});
}

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || null;
    const headerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const cookieToken = req.cookies?.access_token || (() => {
      const parsed = parseCookieString(req.headers?.cookie || "");
      return parsed.access_token || null;
    })();

    const token = headerToken || cookieToken;

    console.log("VERIFY TOKEN: Authorization header:", req.headers.authorization || null);
    console.log("VERIFY TOKEN: cookie header:", req.headers.cookie || null);
    console.log("VERIFY TOKEN: resolved token (header || cookie):", token ? "(present)" : "(missing)");

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log("VERIFY TOKEN: token verification failed:", err && err.message);
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyTokenOptional = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || null;
    const headerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const cookieToken = req.cookies?.access_token || (() => {
      const parsed = parseCookieString(req.headers?.cookie || "");
      return parsed.access_token || null;
    })();

    const token = headerToken || cookieToken;
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      console.log("verifyTokenOptional: token invalid:", err && err.message);
    }
    return next();
  } catch (err) {
    console.error("verifyTokenOptional error:", err);
    return next();
  }
};
