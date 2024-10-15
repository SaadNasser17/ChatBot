import React from 'react'
import { IoCloseOutline, IoRefresh } from "react-icons/io5";

export default function ChatHeader({ toggleChatBox, resetChat }) {
    return (
        <div
            style={{
                backgroundImage: "linear-gradient(to right, #00AEEF, #00ABC6, #00AAB1, #00A99D)",
            }}
            className="d-flex justify-content-between align-items-center py-2 px-3 rounded-top"
        >
            <button className="btn btn-link p-0">
                <img src="logo.png" alt="logo" style={{ height: "1.5rem", width: "7rem" }} />
            </button>
            <div className="d-flex align-items-center">
                <button
                    onClick={resetChat}
                    className="btn btn-link p-2"
                    title="Rafraîchir le chat"
                >
                    <IoRefresh className="text-white" style={{ fontSize: "1.5rem" }} />
                </button>
                <button onClick={toggleChatBox} className="btn btn-link p-2">
                    <IoCloseOutline className="text-white" style={{ fontSize: "1.5rem" }} />
                </button>
            </div>
        </div>
    )
}