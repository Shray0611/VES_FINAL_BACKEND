const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        console.log("No token provided in request");
        return res
          .status(401)
          .json({ error: "Authentication token is required" });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token user ID:", decoded.id);
        console.log("Decoded token role:", decoded.role);
        console.log("Required roles:", roles);
      } catch (jwtError) {
        console.error("JWT verification failed:", jwtError.message);
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const user = await User.findById(decoded.id);

      if (!user) {
        console.log("User not found for ID:", decoded.id);
        return res.status(401).json({ error: "User not found" });
      }

      console.log("Found user:", user.email, "with role:", user.role);

      if (roles.length && !roles.includes(user.role)) {
        console.log(
          `Access denied. User role ${
            user.role
          } not in required roles: ${roles.join(", ")}`
        );
        return res.status(403).json({
          error: `Access denied. Required role: ${roles.join(" or ")}`,
        });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error("Auth middleware error:", err);
      res.status(500).json({ error: "Server error during authentication" });
    }
  };
};

module.exports = auth;
