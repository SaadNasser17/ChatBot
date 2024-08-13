import React from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

export default function ChatBanner({ toggleChatBox, showBanner }) {
  if (!showBanner) return null;

  return (
    <div className="chat-banner slide-in-right position-fixed bottom-0 end-0 mb-3 me-3">
      <div className="banner-content">
        <h2 style={{ textAlign: "right" }}>Bienvenue !</h2>
        <p style={{ textAlign: "right" }}>Essayez notre Chatbot !</p>
        <div className="banner-icon" style={{ marginLeft: "100px" }}>
          <IoChatbubbleEllipsesOutline
            style={{ width: "1.5rem", height: "1.5rem" }}
          />
        </div>
        <button
          className="banner-button"
          style={{ marginLeft: "90px" }}
          onClick={toggleChatBox}
        >
          Cliquez ici
        </button>
      </div>
      <div
        className="arrow-down"
        style={{ marginTop: "1rem", marginLeft: "140px" }}
      >
        ↓
      </div>
    </div>
  );
}
