const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("Received token:", token); // Debug log

    if (!token) {
      console.log("No token provided"); // Debug log
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is expired
      if (decoded.exp < Date.now() / 1000) {
        return res.status(401).json({ message: "Token has expired" });
      }
      
      // Add user from payload
      req.user = decoded;
      
      console.log("Decoded token:", decoded); // Debug log
      
      next();
    } catch (error) {
      console.error("Token verification failed:", error); // Debug log
      return res.status(401).json({ message: "Token is not valid" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error); // Debug log
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = authMiddleware;
