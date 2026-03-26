import { useContext, useEffect, useState, createContext } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(() => {
    const storedUser = localStorage.getItem("selectedUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [unSeenMessages, setUnSeenMessages] = useState({});

  const auth = useContext(AuthContext);
  const socket = auth?.socket;
  const axios = auth?.axios;

  // ✅ Persist selected user (FIXED)
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem("selectedUser");
    }
  }, [selectedUser]);

  // ✅ Get Users
  const getUsers = async () => {
    if (!axios) return;

    try {
      const { data } = await axios.get("/api/messages/users");
      if (data?.success) {
        setUsers(data.users || {});
        setUnSeenMessages(data.unSeenMessages || {});
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to load users");
    }
  };

  // ✅ Get Messages
  const getMessages = async (userId) => {
    if (!axios) return;

    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data?.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to load messages");
    }
  };

  // ✅ Send Message
  const sendMessage = async (messageData) => {
    if (!selectedUser || !axios) return;

    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data?.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to send message");
    }
  };

  // ✅ SOCKET SUBSCRIBE (FULL FIXED)
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.off("newMessage"); // 🔥 prevent duplicate listeners

    socket.on("newMessage", async (newMessage) => {
      const senderId = newMessage.senderId?.toString();

      if (selectedUser && senderId === selectedUser._id?.toString()) {
        // ✅ Add message to chat
        setMessages((prev) => [...prev, { ...newMessage, seen: true }]);

        // ✅ Mark ALL messages as seen
        try {
          await axios.put(`/api/messages/mark/${senderId}`);
        } catch (err) {
          console.error(err);
        }
      } else {
        // ✅ Increase unseen count
        setUnSeenMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    });
  };

  // ✅ Unsubscribe
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  // ✅ Mark messages as seen (when opening chat)
  const markMessagesAsSeen = async (userId) => {
    if (!userId || !axios) return;

    try {
      await axios.put(`/api/messages/mark/${userId}`);

      setUnSeenMessages((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Effects
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  useEffect(() => {
    if (axios) getUsers();
  }, [axios]);

  useEffect(() => {
    if (selectedUser && axios) {
      getMessages(selectedUser._id);
      markMessagesAsSeen(selectedUser._id);
    } else {
      setMessages([]);
    }
  }, [selectedUser, axios]);

  const value = {
    messages,
    users,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    getUsers,
    unSeenMessages,
    setUnSeenMessages,
    markMessagesAsSeen,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};