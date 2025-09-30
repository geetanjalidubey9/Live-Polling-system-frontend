import ChatComponent from "./chatComponent";
import LogoComponent from "./logoComponent";
import { useEffect, useRef,useState } from "react";
import { useSocket } from "./socketContext";
import { useNavigate,useLocation} from "react-router-dom";
import React from "react";

const LoadingComponent: React.FC = () => {
  const [pollData, setPollData] = useState<any>(null);
  const socket = useSocket();
  const navigate = useNavigate();
  const navigatedRef = useRef(false);
  const location = useLocation();
  const studentName= location.state?.studentName ||undefined;

  useEffect(() => {
    if (!socket) return;
    const handleNewPoll = (data: any) => {
      setPollData(data); 
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        navigate("/ques", { state: { pollData: data ,role:"student",studentName:studentName} });
      }
    };
    socket.on("new-poll", handleNewPoll);
    return () => {
      socket.off("new-poll", handleNewPoll);
    };
  }, [socket, navigate]);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <LogoComponent />
      <div className="w-8 h-8 border-4 border-[#4D0ACD] border-t-transparent rounded-full animate-spin mt-10"></div>
      <div className="max-w-[500px] mt-7 flex flex-col justify-center items-center px-4 text-center">
        <h1 className="text-2xl text-black mb-4 font-bold">
          Let's wait for the teacher to ask questions...
        </h1>
      </div>
      <ChatComponent role="teacher"/>
    </div>   
  );
};

export default LoadingComponent;
