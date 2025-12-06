import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * Verify user authentication token
 * Supports both cookie-based and header-based token authentication
 */
const verifyToken = async (req, res, next) => {
  let token;

  // Check for token in cookies first
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // Then check Authorization header as fallback
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "KhÃ´ng cÃ³ access token, vui lÃ²ng Ä‘Äƒng nháº­p",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded._id).select("-password");

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i",
      });
    }

    if (currentUser.isBlocked === true) {
      return res.status(403).json({
        success: false,
        message: "TÃ i khoáº£n Ä‘Ã£ bá»‹ khÃ³a hoáº·c vÃ´ hiá»‡u hÃ³a",
      });
    }

    // Add user to request
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
        expired: true,
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalid",
      });
    }
    res.status(500).json({
      success: false,
      message: "Lá»—i xÃ¡c thá»±c",
      error: error.message,
    });
  }
};

/**
 * Check if user has one of the allowed roles
 * @param {...string} allowedRoles - Roles that are allowed to access
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lÃ²ng Ä‘Äƒng nháº­p",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p chá»©c nÄƒng nÃ y",
      });
    }

    next();
  };
};

export { verifyToken, checkRole };
