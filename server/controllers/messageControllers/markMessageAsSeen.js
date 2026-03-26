import Message from "../../models/Message.js";
import User from "../../models/User.js";

export const markMessageAsSeen = async (req, res) => {
  try {
    const senderId = req.params.id;       // user whose messages you are opening
    const receiverId = req.user._id;      // logged-in user

    await Message.updateMany(
      {
        senderId: senderId,
        receiverId: receiverId,
        seen: false,
      },
      {
        $set: { seen: true },
      }
    );

    // ✅ Get updated unseen messages count for all users
    const unseenMessages = await Message.aggregate([
      {
        $match: {
          receiverId: receiverId,
          seen: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const unseenMap = {};
    unseenMessages.forEach((item) => {
      unseenMap[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      message: "All messages marked as seen",
      unSeenMessages: unseenMap,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};