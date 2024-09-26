import React, { useState } from 'react';
import { IoSend, IoSquare } from 'react-icons/io5';
import { Mic } from 'lucide-react';

export default function ChatFooter({
    userMessage,
    setUserMessage,
    handleUserInput,
    stopBotTyping,
    showSendIcon,
    selectedLanguage 
}) {
    const [isListening, setIsListening] = useState(false);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Function for starting speech recognition
    const startSpeechRecognition = () => {
        if (!SpeechRecognition) {
            alert('Speech Recognition is not supported in your browser. Please use Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();

        switch(selectedLanguage) {
            case 'darija':
            case 'الدارجة':
                recognition.lang = 'ar-MA';
                break;
            case 'العربية':
                recognition.lang = 'ar-SA';
                break;
            case 'francais':
                recognition.lang = 'fr-FR';
                break;
            case 'english':
                recognition.lang = 'en-US';
                break;
            default:
                recognition.lang = 'ar-MA';  
        }

        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Speech recognized:', transcript);
            // Set the transcribed message in the input field
            setUserMessage(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            alert(`Error during speech recognition: ${event.error}`);
        };

        recognition.start();
    };

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
            <div className="d-flex align-items-center">
                {/* Mic button for speech recognition */}
                <button
                    onClick={startSpeechRecognition}
                    className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center me-2"
                    style={{ width: '2.5rem', height: '2.5rem' }}
                >
                    <Mic className={isListening ? "text-danger" : "text-primary"} style={{ fontSize: "1rem" }} />
                </button>

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
    );
}
