import Message from "../../models/Message.js";
import User from "../../models/User.js";

export const getUserForSideBar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filtereduser = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    );
    //count no.of messages that are not seen
    const unSeenMessages = {};
    const promises = filtereduser.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,

        seen: false,
      });
      if (messages.length > 0) {
        unSeenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.status(200).json({
      success: true,
      users: filtereduser,
      unSeenMessages,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
