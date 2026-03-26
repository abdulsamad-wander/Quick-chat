// controllers/userControllers/updateProfile.js
import cloudinary from "../../lib/cloudinary.js";
import User from "../../models/User.js";

export const updateProfile = async (req, res) => {
    try {
        const { fullName, profilePic, bio } = req.body;
        const userId = req.user._id;

        // Validate required fields - but profilePic is optional!
        if (!fullName || !bio) {
            return res.status(400).json({ // Changed to 400 Bad Request
                success: false,
                message: "Full name and bio are required"
            });
        }

        let updatedUser;

        // If profilePic is provided, upload to cloudinary
        if (profilePic) {
            try {
                const upload = await cloudinary.uploader.upload(profilePic, {
                    folder: "chat-app-profiles", // Optional: organize uploads
                });
                
                updatedUser = await User.findByIdAndUpdate(
                    userId, 
                    { 
                        profilePic: upload.secure_url, // Fixed: use upload.secure_url
                        bio, 
                        fullName 
                    }, 
                    { new: true }
                ).select("-password");
            } catch (cloudinaryError) {
                console.error("Cloudinary upload error:", cloudinaryError);
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload image"
                });
            }
        } else {
            // Update without profile picture
            updatedUser = await User.findByIdAndUpdate(
                userId, 
                { bio, fullName }, 
                { new: true }
            ).select("-password");
        }

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update profile"
        });
    }
};