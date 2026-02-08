// src/middleware/authorize.js
export function authorize(roles = []) {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(403).json({ error: "Access denied: missing role" });
      }

      if (!roles.includes(userRole)) {
        return res
          .status(403)
          .json({ error: `Access denied for role: ${userRole}` });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ error: "Internal authorization error" });
    }
  };
}
