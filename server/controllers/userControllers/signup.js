// controllers/userControllers/signup.js
import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import { generateToken } from "../../lib/utils.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      fullName,
      email,
      password: hashPassword,
      bio: bio || "" // Make bio optional
    });

    // Generate token
    const token = generateToken(newUser._id);

    // Remove password from response
    const { password: _, ...userData } = newUser._doc;

    res.status(201).json({
      success: true,
      userData,
      token,
      message: "User created successfully"
    });

  } catch (error) {
    console.log("Signup error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};