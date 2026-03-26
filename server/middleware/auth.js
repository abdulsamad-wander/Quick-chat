// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = async (req, res, next) => {
  try {
    // Get token from header (you're using 'token' header)
    const token = req.headers.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify token - use consistent property name
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // Check if userId exists (from generateToken)
    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

    // Find user by userId
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.log("Auth middleware error:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};