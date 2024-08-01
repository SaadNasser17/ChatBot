import React from 'react'
import { IoSend, IoSquare } from 'react-icons/io5'

export default function ChatFooter({
    userMessage,
    setUserMessage,
    handleUserInput,
    stopBotTyping,
    showSendIcon
}) {
    return (
        <div className="bg-white d-flex align-items-center justify-content-between rounded-bottom border-top p-2">
            <input
                type="text"
                placeholder="Type a message..."
                className="form-control border-0 me-2"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyUp={(e) => e.key === "Enter" && handleUserInput()}
            />
            <div>
                {showSendIcon ? (
                    <button
                        onClick={handleUserInput}
                        className="btn btn-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                        style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#00A99D' }}
                    >
                        <IoSend className="text-white" style={{ fontSize: "1rem" }} />
                    </button>
                ) : (
                    <button
                        onClick={stopBotTyping}
                        className="btn btn-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                        style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#00A99D' }}
                    >
                        <IoSquare className="text-white" style={{ fontSize: "1rem" }} />
                    </button>
                )}
            </div>
        </div>
    )
}
