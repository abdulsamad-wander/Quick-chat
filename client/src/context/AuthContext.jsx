// AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
console.log("🔧 Backend URL configured:", backendUrl);

axios.defaults.baseURL = backendUrl;
axios.defaults.headers.common["Content-Type"] = "application/json";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      authCheck();
    } else {
      setLoading(false);
    }
  }, [token]);

  // ✅ Check authentication
  const authCheck = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        localStorage.removeItem("token");
        setToken(null);
        delete axios.defaults.headers.common["token"];
      }
    } catch (error) {
      console.error("Auth check failed:", error.response?.data || error.message);
      localStorage.removeItem("token");
      setToken(null);
      delete axios.defaults.headers.common["token"];
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login / Signup
  const login = async (state, credentials) => {
    try {
      setLoading(true);
      console.log(`Attempting ${state} with:`, credentials);
      
      // Make sure we're sending the correct data format
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      console.log("Response:", data);
      
      if (data.success) {
        setAuthUser(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        connectSocket(data.userData);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "An error occurred";
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    
    toast.success("Logout successful");
  };

  // ✅ Update Profile
  const updateProfile = async (body) => {
    try {
      setLoading(true);
      const { data } = await axios.put("/api/auth/update-profile", body);
      
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Connect Socket
  const connectSocket = (userData) => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    if (!userData?._id) {
      console.log("No user data for socket connection");
      return;
    }

    try {
      console.log("🔄 Connecting socket to:", backendUrl);
      
      const newSocket = io(backendUrl, {
        query: { userId: userData._id },
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        withCredentials: false, // Add this
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected successfully:", newSocket.id);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
      });

      newSocket.on("getOnlineUsers", (userIds) => {
        console.log("👥 Online users:", userIds);
        setOnlineUsers(userIds);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected. Reason:", reason);
      });

      setSocket(newSocket);

    } catch (error) {
      console.error("Failed to create socket connection:", error);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    loading,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};