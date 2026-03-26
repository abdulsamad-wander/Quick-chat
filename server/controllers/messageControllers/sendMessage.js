import cloudinary from "../../lib/cloudinary.js";
import Message from "../../models/Message.js";
import { io, userSocketMap } from "../../server.js";

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    // Validate input
    if (!text && !image) {
      return res.status(400).json({
        success: false,
        message: "Message must contain text or image",
      });
    }

    // Check if receiver exists (optional but recommended)
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    let imageURL = null;

    // Upload image to Cloudinary if present
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "chat_images", // Optional: organize images in a folder
          transformation: [
            { width: 1000, height: 1000, crop: "limit" }, // Limit image size
          ],
        });
        imageURL = uploadResponse.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
          error: cloudinaryError.message,
        });
      }
    }

    // Create new message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || null,
      image: imageURL,
    });

    // Populate sender information for real-time update
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "_id fullName profilePic email")
      .lean();

    // 🔥 Normalize senderId to always be STRING (VERY IMPORTANT)
    populatedMessage.senderId = populatedMessage.senderId._id.toString();

    // Emit socket event for real-time messaging
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);

      // Optional: Also emit to sender to confirm delivery
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageSent", populatedMessage);
      }
    }

    res.status(201).json({
      // Changed to 201 for resource creation
      success: true,
      newMessage: populatedMessage,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
