import React from "react";
import LogoComponent from "./logoComponent"; 

const LoadingPage: React.FC = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-100">
      <LogoComponent />
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mt-10"></div>
      <div className="mt-6 text-center max-w-[400px] px-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
          Please wait, loading data...
        </h1>
        <p className="text-gray-500 mt-2">
          We are preparing everything for you. This will only take a moment.
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
