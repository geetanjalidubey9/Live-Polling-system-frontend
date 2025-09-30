import React, { useState, useEffect } from "react";

type ToastProps = {
  message: string;
  type: "success" | "error";
  duration?: number; // in ms
};

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        padding: "12px 20px",
        borderRadius: "8px",
        color: "#fff",
        backgroundColor: type === "success" ? "#7765DA" : "#FF4C4C",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  );
};

export default Toast;
