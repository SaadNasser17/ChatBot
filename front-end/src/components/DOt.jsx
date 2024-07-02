import React from "react";

export default function DOt() {
  return (
    <div
      className="typing-indicator"
      style={{ display: "flex", alignItems: "center" }}
    >
      <div
        className="typing-dot"
        style={{
          width: "8px",
          height: "8px",
          margin: "0 2px",
          backgroundColor: "#333",
          borderRadius: "50%",
        }}
      ></div>
      <div
        className="typing-dot"
        style={{
          width: "8px",
          height: "8px",
          margin: "0 2px",
          backgroundColor: "#333",
          borderRadius: "50%",
          animationDelay: "0.2s",
        }}
      ></div>
      <div
        className="typing-dot"
        style={{
          width: "8px",
          height: "8px",
          margin: "0 2px",
          backgroundColor: "#333",
          borderRadius: "50%",
          animationDelay: "0.4s",
        }}
      ></div>
    </div>
  );
}
