const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authorization = req.get("authorization");
  const [scheme, token] = authorization ? authorization.split(" ") : [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    req.user = { id: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;