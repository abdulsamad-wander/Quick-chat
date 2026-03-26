import Message from "../../models/Message.js";

export const getMessages = async (req, res) => {
  try {
    const { id: selectedId } = req.params;
    const myId = req.user._id;
    // sending messages
    const messages = await Message.find({
      $or: [
{ senderId: myId, receiverId: selectedId },
{ senderId: selectedId, receiverId: myId },
      ],
    });
    await Message.updateMany(
      {
        senderId: selectedId,
        receiverId: myId,
      },
      { seen: true },
    );
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
