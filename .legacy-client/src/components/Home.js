import React from "react";
import icon from "./icon.png";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-200 to-gray-300">
      <img src={icon} alt="Logo" className="h-50 w-50 mb-8 mt-2" />
      <div className="text-4xl font-bold text-gray-800">
        WELCOME TO THE HOMICIDE MEDIA TRACKER
      </div>
    </div>
  );
}

export default Home;
