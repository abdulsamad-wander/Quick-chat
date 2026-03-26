// controllers/userControllers/login.js
import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    
    const checkPassword = await bcrypt.compare(password, user.password);
    
    if (!checkPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    
    // Use the same token format as signup
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d"
    });
    
    // Remove password from response
    const { password: _, ...userData } = user._doc;
    
    return res.status(200).json({
      success: true,
      message: `Welcome back ${user.fullName}`,
      token, // Use 'token' instead of 'accessToken' to match frontend
      userData,
    });
  } catch (error) {
    console.log("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};