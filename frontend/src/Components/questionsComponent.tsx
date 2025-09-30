import React, { useState, useEffect } from "react";
import ChatComponent from "./chatComponent";
import { useLocation, useNavigate} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "./socketContext";
import LoadingComponent from "./Loading";
import { FaClock } from "react-icons/fa";
import Toast from "./toaster";

type PollData = {
  teacherId:string
  question: string;
  options: string[];
  pollId: string;
};
interface QuesComponentProps {
  pollData?: PollData;
  role:"teacher"
}
const QuesComponent: React.FC<QuesComponentProps> = ({pollData: propPollData,role})=> {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{message: string, type: "success"|"error"} | null>(null);
  const storedTime = sessionStorage.getItem("timeLeft");
  const [timeLeft, setTimeLeft] = useState(storedTime ? parseInt(storedTime) : 60);
  const socket = useSocket(); 
  const location = useLocation();
  const currentRole = location.state?.role||role;
  const studentName=location.state?.studentName||sessionStorage.getItem("role") || undefined;
  const pollData =  propPollData ||location.state?.pollData as PollData;
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [percentages, setPercentages] = useState<{ [key: string]: number }>({});
console.log(studentId)
   useEffect(() => {
    let id = sessionStorage.getItem("studentId");
    if (!id) {
      id = uuidv4();
      sessionStorage.setItem("studentId", id);
    }
    setStudentId(id);
    if (socket && pollData) {
      socket.emit("student-join", {
        studentId: id,
        studentName: studentName,
        pollId: pollData.pollId,
        teacherId:pollData.teacherId
      });
    }
  }, [socket, pollData]);
  if (!pollData)return <LoadingComponent/>
  const handleSubmit = async () => {
    if (!selectedAnswer) {
      setToast({message:"please select answer",type:"error"})
      return;
    } 
   const payload = {
    role: "student",
    studentId: sessionStorage.getItem("studentId") || "",
    studentName: studentName,
    pollId: pollData.pollId,
    answer: selectedAnswer,
  };
    try {
      const response = await fetch("https://live-polling-system-backend-production-4f28.up.railway.app/api/users/student-ans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Error submitting answer:", data.message);
        alert(data.message);
      } else {
        console.log("Answer submitted successfully:", data);
      if (socket) {
      socket.emit("submit-answer", {
        studentId: payload.studentId,
        pollId:pollData.pollId,
        options:pollData.options,
        answer: payload.answer,
      });
      setSubmitted(true); 
    
   }     
  setToast({message:"Answer submitted successfully!",type:"success"});
    }
    } catch (err) {
      console.error("Error sending answer:", err);
      setToast({message:"Something went wrong!",type:"success"});
    } 

  }
useEffect(() => {
  if (!socket) return;
    setTimeLeft(60);
  sessionStorage.setItem("timeLeft", "60"); 
  setSubmitted(false); 
  setSelectedAnswer(null);
  socket.on("poll-update", (data) => {
    console.log("Poll update received:", data);
    setPercentages(data.percentages); 
  });
  return () => {
    socket.off("poll-update");
  };
}, [socket]);

  //  useEffect(() => {
  //   if (currentRole === "teacher") return;
  //   if (submitted) return;
  //   const interval = setInterval(() => {
  //     setTimeLeft((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(interval);
  //         setToast({ message: "Time over! Start again.", type: "error" });
  //         return 0;
  //       }
  //       sessionStorage.setItem("timeLeft", (prev - 1).toString());
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [currentRole, submitted]);
  useEffect(() => {
  if (currentRole === "teacher") return;
  if (submitted){
     setTimeout(() => {
 sessionStorage.setItem("role", currentRole || "");
    sessionStorage.setItem("studentName", studentName || "");
            navigate("/waiting");
          }, 6000); 
    return
  }
  const interval = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        setToast({ message: "Time over! Start again.", type: "error" });
        if (!submitted) {
          setTimeout(() => {
    sessionStorage.setItem("role", currentRole || "");
    sessionStorage.setItem("studentName", studentName || "");
            navigate("/waiting");
          }, 2000); 
        }
        return 0;
      }   
      sessionStorage.setItem("timeLeft", (prev - 1).toString());
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [currentRole, submitted, navigate]);

  
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-50">
      <div className="w-[550px] rounded-lg flex flex-col p-4">
        <div className=" flex justify-between">
         <h3 className="mb-2 font-semibold">Question</h3>
         {currentRole === "student"&&!submitted&&(
         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaClock size={20} color="black" />
         <h2 className="text-red-700 text-bold text-[13px]">{timeLeft} sec</h2>
        </div>
           )}
        </div>
        <div className="border border-[#AF8FF1] rounded-lg">
        <div className="w-full h-[50px] bg-gradient-to-r from-[#343434] to-[#6E6E6E] rounded-t-lg flex items-center px-4">
          <h2 className="text-white text-[17px] font-semibold">{pollData.question}</h2>
        </div>
          <div className="flex flex-col gap-4 p-4">
            {pollData.options.map((opt, idx) => {
            const percent = percentages[opt] || 0;
            return (
              <div
                key={idx}
                onClick={() => !submitted && setSelectedAnswer(opt)}
                className={`relative flex items-center justify-between p-4 border rounded-md cursor-pointer overflow-hidden transition
                  ${selectedAnswer === opt && !submitted ? "bg-purple-200 border-purple-400" : "bg-[#F7F7F7] border-gray-300"}`}>
                    {submitted && (
                      <div className="absolute top-0 left-0 h-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: "#6766D5" }}></div>
                    )}
                <div className="relative flex items-center gap-4 z-10">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#6766D5] font-semibold">
                    {idx + 1}
                  </div>
                  <span className="text-[#2E2E2E] font-medium text-[16px]">{opt}</span>
                    </div>
                  {submitted&& (
                      <span className="relative z-10 text-sm font-medium font  text-bold text-black">
                        {percent}%
                      </span>
                  )}
                  {currentRole === "teacher" && (
                    <>
                      <div className="absolute top-0 left-0 h-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: "#6766D5" }}></div>
                      <span className="relative z-10 text-sm font-medium text-black font-bold">
                      {percent}%
                      </span>
                    </>
                  )}
          </div>
        );}
      )}
          </div>
        </div>

        {currentRole==="student"&&(
        <div className="flex justify-end mt-4">
          <button
            type="button"
            disabled={submitted}
            onClick={handleSubmit}
            className="w-[120px] h-[42px] btn-color rounded-[34px] flex justify-center items-center transition hover:brightness-105 cursor-pointer disabled:opacity-50">
            submit
          </button> 
        </div>
        )}
        {submitted&&(
        
      <div className="flex flex-col justify-center ">
      <div className="max-w-[500px] mt-7 flex flex-col justify-center items-center px-4 text-center">
        <h1 className="text-2xl text-black mb-4 font-bold">
          Let's wait for the teacher to ask questions...
        </h1>
      </div>
      </div>
      
        )}
      </div>
      <ChatComponent role={currentRole} pollId={pollData.pollId} name={studentName}/>
       {toast && (
      <Toast
        message={toast.message}
        type={toast.type}/>
      )}
    </div>
  );
};

export default QuesComponent;



// import React, { useState, useEffect } from "react";
// import ChatComponent from "./chatComponent";
// import { useLocation, useNavigate } from "react-router-dom";
// import { v4 as uuidv4 } from "uuid";
// import { useSocket } from "./socketContext";
// import LoadingComponent from "./Loading";
// import Toast from "./toaster";
// import { FaClock } from "react-icons/fa";

// type PollData = {
//   teacherId: string;
//   question: string;
//   options: string[];
//   pollId: string;
// };

// interface QuesComponentProps {
//   pollData?: PollData;
//   role: "teacher";
// }

// const QuesComponent: React.FC<QuesComponentProps> = ({ pollData: propPollData, role }) => {
//   const navigate = useNavigate();
//   const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

//   const storedTime = sessionStorage.getItem("timeLeft");
//   const [timeLeft, setTimeLeft] = useState(storedTime ? parseInt(storedTime) : 60);

//   const socket = useSocket();
//   const location = useLocation();

//   const currentRole = location.state?.role || role;
//   const studentName = location.state?.studentName || undefined;
//   const pollData = propPollData || (location.state?.pollData as PollData);

//   const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
//   const [studentId, setStudentId] = useState<string>("");
//   const [submitted, setSubmitted] = useState<boolean>(false);
//   const [percentages, setPercentages] = useState<{ [key: string]: number }>({});

//   // ---------------------- Student join ----------------------
//   useEffect(() => {
//     let id = sessionStorage.getItem("studentId");
//     if (!id) {
//       id = uuidv4();
//       sessionStorage.setItem("studentId", id);
//     }
//     setStudentId(id);

//     if (socket && pollData && currentRole === "student") {
//       socket.emit("student-join", {
//         studentId: id,
//         studentName: studentName,
//         pollId: pollData.pollId,
//         teacherId: pollData.teacherId,
//       });
//     }
//   }, [socket, pollData, currentRole, studentName]);

//   if (!pollData) return <LoadingComponent />;

//   // ---------------------- Submit answer ----------------------
//   const handleSubmit = async () => {
//     if (!selectedAnswer) {
//       alert("Please select an answer!");
//       return;
//     }

//     const payload = {
//       role: "student",
//       studentId: sessionStorage.getItem("studentId") || "",
//       studentName: studentName,
//       pollId: pollData.pollId,
//       answer: selectedAnswer,
//     };

//     try {
//       const response = await fetch("http://localhost:8000/api/users/student-ans", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         console.error("Error submitting answer:", data.message);
//         alert(data.message);
//       } else {
//         console.log("Answer submitted successfully:", data);
//         if (socket) {
//           socket.emit("submit-answer", {
//             studentId: payload.studentId,
//             pollId: pollData.pollId,
//             options: pollData.options,
//             answer: payload.answer,
//           });
//         }
//         setSubmitted(true);
//         alert("Answer submitted successfully!");
//         sessionStorage.removeItem("timeLeft"); // reset timer for next poll
//       }
//     } catch (err) {
//       console.error("Error sending answer:", err);
//       alert("Something went wrong!");
//     }
//   };

//   // ---------------------- Poll updates ----------------------
//   useEffect(() => {
//     if (!socket) return;
//     const handlePollUpdate = (data: { percentages: { [key: string]: number } }) => {
//       setPercentages(data.percentages);
//     };
//     socket.on("poll-update", handlePollUpdate);
//     return () => {
//       socket.off("poll-update", handlePollUpdate);
//     };
//   }, [socket]);

//   // ---------------------- Timer logic ----------------------
//   useEffect(() => {
//     if (currentRole === "teacher") return; // teacher doesn't need timer

//     if (submitted) return; // stop timer if submitted

//     const interval = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           setToast({ message: "Time over! Start again.", type: "error" });
//           return 0;
//         }
//         sessionStorage.setItem("timeLeft", (prev - 1).toString());
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [currentRole, submitted]);
  
//   return (
//     <div className="w-screen h-screen flex justify-center items-center bg-gray-50">
//       <div className="w-[550px] rounded-lg flex flex-col p-4">
//         <div className=" flex justify-between">
//           <h3 className="mb-2 font-semibold">Question</h3>
//           {currentRole === "student" && !submitted && (
//             <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//               <FaClock size={20} color="black" />
//               <h2 className="text-red-700 text-bold text-[13px]">{timeLeft} sec</h2>
//             </div>
//           )}
//         </div>

//         <div className="border border-[#AF8FF1] rounded-lg">
//           <div className="w-full h-[50px] bg-gradient-to-r from-[#343434] to-[#6E6E6E] rounded-t-lg flex items-center px-4">
//             <h2 className="text-white text-[17px] font-semibold">{pollData.question}</h2>
//           </div>
//           <div className="flex flex-col gap-4 p-4">
//             {pollData.options.map((opt, idx) => {
//               const percent = percentages[opt] || 0;
//               return (
//                 <div
//                   key={idx}
//                   onClick={() => !submitted && setSelectedAnswer(opt)}
//                   className={`relative flex items-center justify-between p-4 border rounded-md cursor-pointer overflow-hidden transition
//                   ${selectedAnswer === opt && !submitted ? "bg-purple-200 border-purple-400" : "bg-[#F7F7F7] border-gray-300"}`}
//                 >
//                   {submitted && (
//                     <div
//                       className="absolute top-0 left-0 h-full transition-all duration-500"
//                       style={{ width: `${percent}%`, backgroundColor: "#6766D5" }}
//                     />
//                   )}
//                   <div className="relative flex items-center gap-4 z-10">
//                     <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#6766D5] font-semibold">
//                       {idx + 1}
//                     </div>
//                     <span className="text-[#2E2E2E] font-medium text-[16px]">{opt}</span>
//                   </div>
//                   {submitted && (
//                     <span className="relative z-10 text-sm font-medium text-black font-bold">{percent}%</span>
//                   )}
//                   {currentRole === "teacher" && (
//                     <>
//                       <div
//                         className="absolute top-0 left-0 h-full transition-all duration-500"
//                         style={{ width: `${percent}%`, backgroundColor: "#6766D5" }}
//                       />
//                       <span className="relative z-10 text-sm font-medium text-black font-bold">{percent}%</span>
//                     </>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//         {currentRole === "student" && (
//           <div className="flex justify-end mt-4">
//             <button
//               type="button"
//               disabled={submitted}
//               onClick={handleSubmit}
//               className="w-[120px] h-[42px] btn-color rounded-[34px] flex justify-center items-center transition hover:brightness-105 cursor-pointer disabled:opacity-50"
//             >
//               submit
//             </button>
//           </div>
//         )}
//         {submitted && (
//           <div className="flex flex-col justify-center">
//             <div className="max-w-[500px] mt-7 flex flex-col justify-center items-center px-4 text-center">
//               <h1 className="text-2xl text-black mb-4 font-bold">
//                 Let's wait for the teacher to ask questions...
//               </h1>
//             </div>
//           </div>
//         )}
//       </div>
//       <ChatComponent role={currentRole} pollId={pollData.pollId} name={studentName} />
//     </div>
//   );
// };

// export default QuesComponent;

//         {/* <div className="border border-[#AF8FF1] rounded-lg">
//           <div className="w-full h-[50px] bg-gradient-to-r from-[#343434] to-[#6E6E6E] rounded-t-lg flex items-center px-4">
//             <h2 className="text-white text-[17px] font-semibold">{pollData.question}</h2>
//           </div>
//           <div className="flex flex-col gap-4 p-4">
//             {pollData.options.map((opt, idx) => (
//               <div
//                 key={idx}
//                 onClick={() => !submitted && setSelectedAnswer(opt)}
//                 className={`flex flex-col gap-2 p-4 border rounded-md cursor-pointer transition ${
//                   selectedAnswer === opt
//                     ? "bg-purple-200 border-purple-400"
//                     : "bg-[#F7F7F7] border-gray-300" }`}>
//                 <div className="flex items-center gap-4">
//                   <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-white font-semibold">
//                     {idx + 1}
//                   </div>
//                   <span className="text-[#2E2E2E] font-medium text-[16px]">{opt}</span>
//                 </div>
//                 {submitted&&(
//                   <div>
//                     <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//                       <div
//                         className="bg-purple-500 h-3 rounded-full transition-all duration-500"
//                         style={{ width: `${percentages[opt] || 0}%` }}
//                       ></div>
//                     </div>
//                     <span className="text-sm text-gray-600">{percentages[opt] || 0}%</span>
//                  </div>
//             )} 
            
//           {currentRole==="teacher"&&(
//                   <div>
//                     <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//                       <div
//                         className="bg-purple-500 h-3 rounded-full transition-all duration-500"
//                         style={{ width: `${percentages[opt] || 0}%` }}
//                       ></div>
//                     </div>
//                     <span className="text-sm text-gray-600">{percentages[opt] || 0}%</span>
//                  </div>
//             )}
//               </div>
//             ))}
//           </div>
//         </div> */}