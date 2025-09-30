import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
       const newSocket = io("live-polling-system-backend-production-4f28.up.railway.app", {
      transports: ["websocket", "polling"],
      withCredentials: true
    });

    setSocket(newSocket);

    // newSocket.on("connect", () => console.log("Socket connected:", newSocket.id));
    newSocket.on("connect", () => {});

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
