import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, getMessages, sendMessage } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);


  // 
  useEffect(() => {
  if (selectedUser) {
    localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
  } else {
    localStorage.removeItem("selectedUser");
  }
}, [selectedUser]);

  const [input, setInput] = useState("");
  const scrollEnd = useRef();

  // ✅ Send text message
  const handleSendMessages = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // ✅ Send image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];

    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }

    // 🚨 Prevent large file uploads (VERY IMPORTANT)
    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        await sendMessage({
          image: reader.result, // base64 string
        });
      } catch (error) {
        toast.error("Failed to send image", error);
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file");
    };

    reader.readAsDataURL(file);

    // reset input
    e.target.value = "";
  };

  // ✅ Load messages
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // ✅ Auto scroll
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg flex flex-col">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-gray-600">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 h-8 rounded-full"
        />

        <p className="flex-1 text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </p>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          className="w-5 cursor-pointer md:hidden"
        />
      </div>

      {/* ---------- CHAT AREA ---------- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const isMe = msg.senderId?.toString() === authUser._id?.toString();

          return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-end gap-2 max-w-[70%] ${
                  isMe ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <img
                  src={
                    isMe
                      ? authUser?.profilePic || assets.avatar_icon
                      : selectedUser?.profilePic || assets.avatar_icon
                  }
                  className="w-7 h-7 rounded-full"
                />

                {/* Message */}
                <div>
                  {msg.image ? (
                    <img
                      src={msg.image}
                      className="max-w-[220px] rounded-2xl border border-gray-700"
                    />
                  ) : (
                    <p
                      className={`px-4 py-2 text-sm rounded-2xl break-words ${
                        isMe
                          ? "bg-violet-600 text-white rounded-br-none"
                          : "bg-gray-700 text-white rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </p>
                  )}

                  <p className="text-[10px] text-gray-400 mt-1 text-center">
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={scrollEnd}></div>
      </div>

      {/* ---------- INPUT AREA ---------- */}
      <div className="p-3 border-t border-gray-600 flex items-center gap-2 bg-black/40 backdrop-blur-md">
        <div className="flex-1 flex items-center bg-gray-800 rounded-full px-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessages(e)}
            className="flex-1 bg-transparent text-white text-sm p-3 outline-none"
          />

          {/* Image Upload */}
          <input
            type="file"
            id="image"
            hidden
            accept="image/png, image/jpeg"
            onChange={handleSendImage}
          />
          <label htmlFor="image" className="cursor-pointer">
            <img src={assets.gallery_icon} className="w-5 mr-2" />
          </label>
        </div>

        {/* Send Button */}
        <img
          onClick={handleSendMessages}
          src={assets.send_button}
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <img src={assets.logo_icon} className="w-16 mb-2" />
      <p className="text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
