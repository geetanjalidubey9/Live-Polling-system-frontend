import { useState } from "react";
import LogoComponent from "./logoComponent";
import { useNavigate } from "react-router-dom";
import React from "react";

type Role = "teacher" | "student";
const WelcomeScreen: React.FC = () => {
  const [role, setRole] = useState<Role | "">("");
  const navigate = useNavigate();

  const handleRole = (selectedRole: Role) => {
    setRole(selectedRole);
  };

  const handleSubmit = async () => {
    if (role === "teacher") {
      navigate("/poll", { state: { role: role as Role } });
    } else {
      navigate("/student", { state: { role: role as Role } });
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <LogoComponent />
      <div className="max-w-[600px] mt-7 flex flex-col justify-center items-center px-4 text-center">
        <h1 className="text-3xl text-black mb-2">
          Welcome to the <span className="font-bold">Live Polling System</span>
        </h1>
        <p className="text-sm text-black/60">
          Please select the role that best describes you to begin using the live
          polling system
        </p>
      </div>
      <div className="mt-7 flex gap-6 justify-center item-center">
        <div
          onClick={() => handleRole("student")}
          className={`cursor-pointer w-[30%] min-w-[20%] border-3 rounded-xl p-4 transition ${
            role === "student"
              ? "border-[#7765DA] shadow-lg"
              : "border-gray-300"
            }`}>
          <h2 className="text-[18px] font-semibold">I'm a Student</h2>
          <p className="text-[12px] text-gray-500 mt-2">
            Join polls, participate in quizzes and interact with your teacher.
          </p>
        </div>
        <div
          onClick={() => handleRole("teacher")}
          className={`cursor-pointer w-[30%]  min-w-[20%] border-3 rounded-xl p-4 transition ${
            role === "teacher"
              ? "border-[#7765DA] shadow-lg"
              : "border-gray-300"
          }`}>
          <h2 className="text-[18px] font-semibold">I'm a Teacher</h2>
          <p className="text-[12px]  text-gray-500 mt-2">
            Create live polls, quizzes and engage with your students easily.
          </p>
        </div>
      </div>
      <div className="mt-7">
        <button
          onClick={handleSubmit}
          disabled={!role}
          className="btn-color cursor-pointer w-[150px] h-[40px] flex justify-center items-center rounded-[34px] text-white font-sora font-semibold leading-[23px] transition ">
          Continue
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
