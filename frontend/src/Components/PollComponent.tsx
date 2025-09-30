import type React from "react";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import LogoComponent from "./logoComponent";
import QuesComponent from "./questionsComponent";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "./socketContext";
import Toast from "./toaster";

type pollPayload = {
  role:string
  teacherId: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

const PollComponent: React.FC = () => {
  const [pollComplete, setPollComplete] = useState(false);
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  // const [createdPollData, setCreatedPollData] = useState<pollPayload & { pollId: string } | null>/(null);
  const [quesAsked, setquesAsked] = useState<boolean>(() => {
  return sessionStorage.getItem("quesAsked") === "true";
});
const [createdPollData, setCreatedPollData] = useState<pollPayload & { pollId: string } | null>(() => {
  const saved = sessionStorage.getItem("createdPollData");
  return saved ? JSON.parse(saved) : null;
});
  const role = location.state?.role as "teacher" | undefined;
  const [ques, setQues] = useState("");
  // const [quesAsked,setquesAsked]= useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAns, setCorrectAns] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [newOption, setNewOption] = useState("");
  const [toast, setToast] = useState<{message: string, type: "success"|"error"} | null>(null);

  useEffect(() => {
    if (role === "teacher") {
      const CreateTeacherId = (): string => {
      let teacherId = sessionStorage.getItem("teacherId");
      if (!teacherId) {
        teacherId = uuidv4();
        sessionStorage.setItem("teacherId", teacherId);
      }
        console.log("teacherid",teacherId);
      return teacherId;
      };
      CreateTeacherId();
    }
    else {
      setToast({ message: "role is not correct!", type: "error" });
      setTimeout(()=>{
        navigate("/");
      },3000)
    }
  }, [role]);

useEffect(() => {
    if (!socket) return;
    socket.on("poll-complete", (data) => {
      console.log("Poll completed:", data);
         setToast(null);
      setPollComplete(true);
          setToast(null);
       setTimeout(() => {
      setToast({message:"All students answered! You can ask a new question now.",type:"success"});
          }, 10);
    });
    return () => {
      socket.off("poll-complete");
    };
  }, [socket]);

const handleAskNewQuestion = () => {
  if (!pollComplete) {
    setToast(null);
    setTimeout(() => {
    setToast({ message: "Wait! Current poll not complete yet.", type: "error" });
        }, 10);
      return;
    }
  setPollComplete(false);  
  setquesAsked(false);       
  setCreatedPollData(null);
  setQues("");  
  setOptions([]); 
  setCorrectAns("");   
  setShowInput(false);       
  setNewOption("");         
};

const handleAddOption = () => {
  const trimmedOption = newOption.trim().toLowerCase();
   if (options.length >= 4) {
    setToast(null);
    setTimeout(() => {
      setToast({ message: "Maximum 4 options allowed!", type: "error" });
    }, 10);
    return;
  }
  if (trimmedOption === "") {
    setToast(null);
    setTimeout(() => {
      setToast({ message: "Empty field not allowed", type: "error" });
    }, 10);
    return;
  }
  if (options.some(opt => opt.trim().toLowerCase() === trimmedOption)) {
    setToast(null);
    setTimeout(() => {
      setToast({ message: "option already present!", type: "error" });
    }, 10);
    return;
  }
  setOptions((prev) => [...prev, newOption.trim()]);
  setNewOption("");
  setShowInput(false);
    setToast(null);
    setTimeout(() => {
      setToast({ message: "Option Added Successfully!", type: "success" });
    }, 10);
};

  const onAskQuestion = async () => {
    setToast(null);
    setTimeout(() => {
      setToast({ message: "ques and Atleast 2 option is required!", type: "error" });
    }, 10);
    const payload: pollPayload = {
      role: "teacher",
      teacherId: sessionStorage.getItem("teacherId") || "",
      question: ques,
      options,
      correctAnswer: correctAns,
    };
    try {
      const data = await handleQues(payload);
      if (data && data.success && data.poll) {
        const pollData = { ...payload, pollId: data.poll._id };
          sessionStorage.setItem("createdPollData", JSON.stringify(pollData));
        setCreatedPollData(pollData);
        if (socket) {
        socket.emit("create-poll", { pollData });    
        const teacherId = sessionStorage.getItem("teacherId") || "";
        socket.emit("teacher-join",{ pollId: data.poll._id, teacherId });     
        }
      }
    } catch (err) {
      console.error("Error sending poll:", err);
    }
    setquesAsked(true);
  };

  async function handleQues(payload: pollPayload) {
    try {
      const response = await fetch("https://live-polling-system-backend-production-4f28.up.railway.app/api/users/create-poll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error("Failed to send question");
      }
      const data = await response.json();
       setToast({ message: "Poll is live!", type: "success" });
      return data;
    } 
    catch (error) {
        setToast({ message: "error!", type: "error" });
    }
  }

  const openHistory=async ()=>{
    navigate("/poll-history");
  }
  
  return (
    <div>
      {toast && (
      <Toast
        message={toast.message}
        type={toast.type}/>
      )}
      {quesAsked && createdPollData ? (
      <div className="relative">
        <button
          onClick={openHistory}
          type="button"
          className=" cursor-pointer btn-color rounded-[34px] px-6 py-3 text-[16px] absolute top-2 right-2 flex items-center gap-2 px-3 py-2 text-white hover:brightness-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
          </svg>
          View Poll History
        </button>
        <QuesComponent pollData={createdPollData} role="teacher" />    
          <button
          onClick={handleAskNewQuestion}
          type="button"
          className=" cursor-pointer btn-color rounded-[34px] px-6 py-3 text-[16px]  flex  absolute bottom-5 right-92 items-center gap-2 px-3 py-2 text-white hover:brightness-105">
            +Ask new question
          </button>        
      </div>
    ):(
    <div className="relative w-full h-screen">
      <div className="ml-[10%]">
        <LogoComponent />
        <div className="mt-4 flex flex-col justify-left items-left">
          <h1 className="text-3xl text-black mb-2">
            Let's <span className="font-bold">Get Started</span>
          </h1>
          <p className="text-sm w-[50%] text-black/60">
            you’ll have the ability to create and manage polls, ask questions, and monitor your students'
            responses in real-time
          </p>
        </div>
        <div className="relative mt-4 w-[60%] min-w-[250px]">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="Question" className="block text-[13px] leading-[23px]">
              Enter your Question
            </label>
            <div className="relative inline-block">
              <div className="bg-gray-200 w-[100%] h-[36px] rounded-[7px] flex items-center justify-between px-3">
                <span className="text-[12px] text-black">60 seconds</span>
                <svg
                  className="w-5 h-5 text-[#480FB3]"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M12 16l-6-8h12l-6 8z" />
                </svg>
              </div>
            </div>
          </div>
          <textarea
            value={ques}
            onChange={(e) => setQues(e.target.value)}
            id="Question"
            name="Question"
            className="w-full h-[130px] bg-gray-200 rounded-sm px-4 pt-2 text-[13px] text-left resize-none focus:outline-none focus:ring-2 focus:ring-[#4D0ACD]"
          ></textarea>
        </div>
      <div className="relative mt-4 w-[60%]">
        <div className="flex items-center justify-between mb-1 font-bold text-[13px]">
          <label className="leading-[23px] mb-2">Edit Options</label>
          <label className="leading-[23px] mb-2 mr-[5.9%]">Is it Correct?</label>
        </div>
        {options.map((option, index) => (
          <div key={index} className="flex items-center mb-4">
            <div className="w-4 h-4 bg-[#4D0ACD] rounded-full flex items-center justify-center text-white font-semibold mr-3 text-[10px]">
              {index + 1}
            </div>
            <div className="w-[100%] flex justify-between mb-1">
              <div className="bg-gray-200 rounded-sm px-4 py-2 text-[13px] w-[50%]">{option}</div>
              <div className="flex gap-6 items-right p-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                      correctAns === option ? "border-[#7451B6]" : "border-gray-400"
                    }`}
                    onClick={() => setCorrectAns(option)}
                  >
                    {correctAns === option && (
                      <div className="w-2 h-2 bg-[#7451B6] rounded-full"></div>
                    )}
                  </div>
                  <span className="text-[13px]">Yes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                      correctAns !== "" && correctAns !== option ? "border-[#7451B6]" : "border-gray-400"
                    }`}
                    onClick={() => setCorrectAns("no-" + option)} 
                  >
                    {correctAns === "no-" + option && (
                      <div className="w-2 h-2 bg-[#7451B6] rounded-full"></div>
                    )}
                  </div>
                  <span className="text-[13px]">No</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {showInput && (
          <div className="flex items-center mb-4 mt-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddOption();
              }}
              placeholder="Type new option..."
              className="bg-gray-200 rounded-sm px-4 py-3 text-[13px] w-[50%]"/>
            <button
              onClick={handleAddOption}
              className="ml-2 px-4 py-1 bg-[#7451B6] text-white rounded cursor-pointer">
              Add
            </button>
          </div>
        )}
      </div>
      {!showInput && (
        <div
          className="mt-4 w-[169px] h-[45px] flex justify-center items-center gap-2 px-[10px] border border-[#7451B6] rounded-[11px] cursor-pointer"
          onClick={() => setShowInput(true)}>
          <span className="font-sora font-semibold text-[14px] leading-[18px] text-[#7C57C2]">+ Add More option</span>
        </div>
      )}
      </div>
      <div className="absolute w-[100%] px-6 py-2 mt-7 border-t border-[#B6B6B6]">
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={onAskQuestion}
            className="btn-color rounded-[34px] px-6 py-3 text-[16px] font-small flex justify-center items-center transition hover:brightness-105 cursor-pointer">
            Ask Question
          </button>
        </div>
      </div>
      </div>)}
   
    </div>
  );
};

export default PollComponent;
