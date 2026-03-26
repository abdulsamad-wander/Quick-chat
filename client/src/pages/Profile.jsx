import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { authUser, updateProfile, loading } = useContext(AuthContext);
  const [selectImage, setSelectImage] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // Set form values when authUser is available
  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  // Redirect if not authenticated after loading completes
  useEffect(() => {
    if (!loading && !authUser) {
      navigate('/login');
    }
  }, [authUser, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!authUser) return; // Guard clause
    
    if (!selectImage) {
      await updateProfile({ fullName: name, bio });
      navigate('/');
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(selectImage);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate('/');
    };
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Don't render if no authUser (will redirect via useEffect)
  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
          <h3 className="text-lg">Profile details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectImage
                  ? URL.createObjectURL(selectImage)
                  : authUser?.profilePic || assets.avatar_icon
              }
              alt="profile"
              className={`w-12 h-12 object-cover ${selectImage || authUser?.profilePic ? "rounded-full" : ""}`}
            />
            upload profile image
          </label>
          
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={4}
          ></textarea>

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </form>
        
        <img 
          src={authUser?.profilePic || assets.logo_icon} 
          className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 object-cover" 
          alt="profile"
        />
      </div>
    </div>
  );
};

export default Profile;