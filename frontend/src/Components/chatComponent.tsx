import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "./socketContext";

type Student = {
  studentId: string;
  studentName: string;
};

type ChatComponentProps = {
  role: string;
  pollId: string;
  name:string
};

const ChatComponent: React.FC<ChatComponentProps> = ({ role, pollId,name }) => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [openChat, setOpenChat] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");
  const [participants, setParticipants] = useState<Student[]>([]);
  const [newStudentAlert, setNewStudentAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);

 useEffect(() => {
  if (!socket) return;
  const studentId = role === "teacher" ? "teacher" : name;
  const studentName = role === "teacher" ? "Teacher" : name;
  socket.emit("join-chat", { pollId, studentId, studentName  });
  socket.on("chat-history", (history: { studentId: string; studentName: string; message: string }[]) => {
    const formatted = history.map((msg) => ({
      sender: msg.studentName,
      text: msg.message,
    }));
    setMessages(formatted);
  });
  const handleReceiveMessage = (data: { studentId: string; studentName: string; message: string }) => {
    setMessages((prev) => [...prev, { sender: data.studentName, text: data.message }]);
  };
  socket.on("receive-chat", handleReceiveMessage);
  return () => {
    socket.off("chat-history");
    socket.off("receive-chat", handleReceiveMessage);
  };
}, [socket, pollId, role, name]);
const handleSendMessage = () => {
  if (message.trim() === "") return;
  const sender = role === "teacher" ? "Teacher" : name;
  const studentId = role === "teacher" ? "teacher" : name;
if(socket){
    socket.emit("send-chat", { pollId, studentId, studentName: sender, message });
}
  // Add locally
  setMessages((prev) => [...prev, { sender, text: message }]);
  setMessage("");
};

  const handleOpenChat = () => {
    setOpenChat(!openChat);
    setNewStudentAlert(false);
  };
  useEffect(() => {
    if (!socket) return;

    socket.on("kicked", ({ message }) => {
      console.log("Student kicked:", message);
      alert(message);
      navigate("/kick-out");
    });

    return () => {
      socket.off("kicked");
    };
  }, [socket, navigate]);


  // Send on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleRemoveStudent = (pollId: string, studentId: string) => {
    if (!socket) return;
    socket.emit("remove-student", { pollId, studentId });
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewStudent = (studentList: Student[]) => {
      console.log("Updated student list:", studentList);
      setParticipants(studentList);
      if (!openChat || activeTab !== "participants") {
        setNewStudentAlert(true);
      }
    };

    socket.on("update-student-list", handleNewStudent);

    return () => {
      socket.off("update-student-list", handleNewStudent);
    };
  }, [socket, openChat, activeTab]);

  return (
    <div>
      <div
      className="fixed bottom-10 right-10 w-[60px] h-[56px] bg-[#5767D0] rounded-full flex items-center justify-center cursor-pointer z-40" onClick={handleOpenChat}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {newStudentAlert && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        )}
      </div>
      {openChat && (
        <div className="fixed bottom-[100px] right-10 w-[30%] h-[70%] min-w-[270px] border border-[#DFCCCC] shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-[5px] bg-white z-50 flex flex-col">
          <div className="flex border-b border-[#C5C5C5] relative">
            <button
              className={`flex-1 py-2 text-sm font-semibold cursor-pointer ${
                activeTab === "chat" ? "border-b-4 border-[#8F64E1]" : ""
              }`}
              onClick={() => setActiveTab("chat")}>
              Chat
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold cursor-pointer relative ${
                activeTab === "participants" ? "border-b-4 border-[#8F64E1]" : ""
              }`}
              onClick={() => setActiveTab("participants")} >
              Participants
              {newStudentAlert && activeTab !== "participants" && (
                <div className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "chat" ? (
              // <div className="flex flex-col gap-3">
              // {messages.map((msg, idx) => (
              //     <div
              //       key={idx}
              //       className="flex flex-col w-[228px] max-w-full gap-[2px]" >
              //       <span className="text-[12px] font-semibold text-[#4F0BD3]">
              //         {msg.sender}
              //       </span>
              //       <div className="bg-[#3A3A3B] rounded-[1px_8px_8px_8px] px-3 py-2 text-white">
              //         {msg.text}
              //       </div>
              //     </div>
              //   ))} 
              // </div>
              <div className="flex flex-col gap-3">
  {messages.map((msg, idx) => {
    const isSentByMe = msg.sender === (role === "teacher" ? "Teacher" : name);
    return (
      <div
        key={idx}
        className={`flex flex-col max-w-[228px] gap-[2px] ${
          isSentByMe ? "items-start" : "items-end ml-auto"
        }`}
      >
        <span className="text-[12px] font-semibold text-[#4F0BD3]">
          {msg.sender}
        </span>
        <div
          className={`px-3 py-2 rounded-[1px_8px_8px_8px] text-white ${
            isSentByMe ? "bg-[#5767D0]" : "bg-[#3A3A3B]"
          }`}
        >
          {msg.text}
        </div>
      </div>
    );
  })}
</div>

            ) : (
              <div className="flex flex-col gap-2">

                {participants.map((p) => (               
                  <span key={p.studentId} className="font-semibold">
                    <div className="flex justify-between">
                      <div>
                    {p.studentName}
                    </div>
                    {role === "teacher" && (
                      <button
                        onClick={() => handleRemoveStudent(pollId, p.studentId)}
                        className="ml-2 text-purple-600 underline text-sm font-medium hover:text-purple-800 cursor-pointer">
                        Kick Out
                      </button>
                     )}
                     </div>
                  </span>
                ))}
              </div>
            )}
          </div>
          {activeTab === "chat" && (
            <div className="border-t  min-w-[270px] border-[#C5C5C5] p-2 flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 border w-full rounded px-3 py-2 outline-none text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#5767D0] text-white px-4 py-2 rounded">
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatComponent;


// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSocket } from "./socketContext";

// type Student = {
//   studentId: string;
//   studentName: string;
// };

// type ChatComponentProps = {
//   role: string;
//   pollId: string;
//   name: string;
// };

// const ChatComponent: React.FC<ChatComponentProps> = ({ role, pollId, name }) => {
//   const socket = useSocket();
//   const navigate = useNavigate();

//   const [openChat, setOpenChat] = useState(false);
//   const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");
//   const [participants, setParticipants] = useState<Student[]>([]);
//   const [newStudentAlert, setNewStudentAlert] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState<{ sender: string; text: string; self: boolean }[]>([]);

//   // ---------------------- SEND MESSAGE ----------------------
//   const handleSendMessage = () => {
//     if (message.trim() === "") return;

//     const senderName = role === "teacher" ? "Teacher" : name;

//     // Show your own message on the left (self: true)
//     setMessages((prev) => [...prev, { sender: senderName, text: message, self: true }]);

//     // Emit message to server
//     socket?.emit("send-message", {
//       pollId,
//       sender: senderName,
//       message,
//     });

//     setMessage("");
//   };

//   // ---------------------- RECEIVE MESSAGE ----------------------
//   useEffect(() => {
//     if (!socket) return;

//     const handleReceiveMessage = (data: { sender: string; message: string }) => {
//       const myName = role === "teacher" ? "Teacher" : name;

//       // Ignore messages from self
//       if (data.sender === myName) return;

//       // Show received message on the right (self: false)
//       setMessages((prev) => [...prev, { sender: data.sender, text: data.message, self: false }]);
//     };

//     socket.on("receive-message", handleReceiveMessage);

//     return () => {
//       socket.off("receive-message", handleReceiveMessage);
//     };
//   }, [socket, role, name]);

//   // ---------------------- OPEN/CLOSE CHAT ----------------------
//   const handleOpenChat = () => {
//     setOpenChat(!openChat);
//     setNewStudentAlert(false);
//   };

//   // ---------------------- KICKED ----------------------
//   useEffect(() => {
//     if (!socket) return;

//     const handleKicked = ({ message }: { message: string }) => {
//       alert(message);
//       navigate("/kick-out");
//     };

//     socket.on("kicked", handleKicked);

//     return () => {
//       socket.off("kicked", handleKicked);
//     };
//   }, [socket, navigate]);

//   // ---------------------- REMOVE STUDENT ----------------------
//   const handleRemoveStudent = (pollId: string, studentId: string) => {
//     socket?.emit("remove-student", { pollId, studentId });
//   };

//   // ---------------------- PARTICIPANTS ----------------------
//   useEffect(() => {
//     if (!socket) return;

//     const handleNewStudent = (studentList: Student[]) => {
//       setParticipants(studentList);
//       if (!openChat || activeTab !== "participants") {
//         setNewStudentAlert(true);
//       }
//     };

//     socket.on("update-student-list", handleNewStudent);

//     return () => {
//       socket.off("update-student-list", handleNewStudent);
//     };
//   }, [socket, openChat, activeTab]);

//   // ---------------------- SEND MESSAGE ON ENTER ----------------------
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") handleSendMessage();
//   };

//   return (
//     <div>
//       <div
//         className="fixed bottom-10 right-10 w-[60px] h-[56px] bg-[#5767D0] rounded-full flex items-center justify-center cursor-pointer z-40"
//         onClick={handleOpenChat}
//       >
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           width="23"
//           height="23"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="white"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//         </svg>
//         {newStudentAlert && (
//           <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></div>
//         )}
//       </div>

//       {openChat && (
//         <div className="fixed bottom-[100px] right-10 w-[30%] h-[70%] min-w-[270px] border border-[#DFCCCC] shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-[5px] bg-white z-50 flex flex-col">
//           <div className="flex border-b border-[#C5C5C5] relative">
//             <button
//               className={`flex-1 py-2 text-sm font-semibold cursor-pointer ${
//                 activeTab === "chat" ? "border-b-4 border-[#8F64E1]" : ""
//               }`}
//               onClick={() => setActiveTab("chat")}
//             >
//               Chat
//             </button>
//             <button
//               className={`flex-1 py-2 text-sm font-semibold cursor-pointer relative ${
//                 activeTab === "participants" ? "border-b-4 border-[#8F64E1]" : ""
//               }`}
//               onClick={() => setActiveTab("participants")}
//             >
//               Participants
//               {newStudentAlert && activeTab !== "participants" && (
//                 <div className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full"></div>
//               )}
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto p-4">
//             {activeTab === "chat" ? (
//               <div className="flex flex-col gap-3">
//                 {messages.map((msg, idx) => (
//                   <div
//                     key={idx}
//                     className={`flex flex-col w-[228px] max-w-full gap-[2px] ${
//                       msg.self ? "items-start" : "items-end"
//                     }`}
//                   >
//                     <span className="text-[12px] font-semibold text-[#4F0BD3]">{msg.sender}</span>
//                     <div
//                       className={`px-3 py-2 rounded-[1px_8px_8px_8px] text-white ${
//                         msg.self ? "bg-[#3A3A3B]" : "bg-[#5767D0]"
//                       }`}
//                     >
//                       {msg.text}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="flex flex-col gap-2">
//                 {participants.map((p) => (
//                   <span key={p.studentId} className="font-semibold">
//                     <div className="flex justify-between">
//                       <div>{p.studentName}</div>
//                       {role === "teacher" && (
//                         <button
//                           onClick={() => handleRemoveStudent(pollId, p.studentId)}
//                           className="ml-2 text-purple-600 underline text-sm font-medium hover:text-purple-800 cursor-pointer"
//                         >
//                           Kick Out
//                         </button>
//                       )}
//                     </div>
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>

//           {activeTab === "chat" && (
//             <div className="border-t min-w-[270px] border-[#C5C5C5] p-2 flex items-center gap-2">
//               <input
//                 type="text"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="Type a message..."
//                 className="flex-1 border w-full rounded px-3 py-2 outline-none text-sm"
//               />
//               <button
//                 onClick={handleSendMessage}
//                 className="bg-[#5767D0] text-white px-4 py-2 rounded"
//               >
//                 Send
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatComponent;
