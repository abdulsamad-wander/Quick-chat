import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx'; 

const App = () => {
  const { authUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('./src/assets/bgImage.svg')] bg-contain">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('./src/assets/bgImage.svg')] bg-contain">
      <Toaster />
      <Routes>
        <Route 
          path='/' 
          element={
            authUser ? (
              <ChatProvider> 
                <Home />
              </ChatProvider>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path='/login' 
          element={!authUser ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path='/profile' 
          element={
            authUser ? (
              <ChatProvider> 
                <Profile />
              </ChatProvider>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </div>
  );
}

export default App;