import React, { useContext } from "react";
import SideBar from "../components/SideBar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import RightSideContainer from "../components/RightSideContainer.jsx";
import { ChatContext } from "../context/ChatContext.jsx";

const Home = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="h-screen border overflow-hidden w-full sm:px-[12%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid grid-cols-1 grid-rows-[1fr] relative ${
          selectedUser
            ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : "md:grid-cols-2"
        }`}
      >
        <SideBar />
        <ChatContainer />
        {selectedUser && <RightSideContainer />}
      </div>
    </div>
  );
};

export default Home;
