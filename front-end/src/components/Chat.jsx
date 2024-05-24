import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import { IoChatbubbles, IoCloseOutline, IoSend, IoRefresh, IoSquare } from "react-icons/io5";
import SpecialtiesDropdown from "./SpecialtiesDropdown";
import Doctor from "./Doctor";
import { motion } from "framer-motion";
import { useBooking } from "./BookingContext";
import AniText from "./Anitext";

export default function Chat() {
  const { bookingDetails, setBookingDetails } = useBooking();
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [initialMessageSet, setInitialMessageSet] = useState(false);
  const [showSpecialtiesDropdown, setShowSpecialtiesDropdown] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [showDoctors, setShowDoctors] = useState(false);
  const [appointmentStep, setAppointmentStep] = useState(0);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [forceStopTyping, setForceStopTyping] = useState(false);
  const messageRefs = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!initialMessageSet) {
      displayBotMessage("Ana NabadyBot, Bach ne9der n3awnek");
      setInitialMessageSet(true);
    }
  }, [initialMessageSet]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChatBox = () => {
    setIsOpen(!isOpen);
  };

  const handleUserInput = async () => {
    if (userMessage.trim()) {
      const msg = userMessage.trim();
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      displayUserMessage(msg, currentTime);
      setUserMessage("");

      if (appointmentStep > 0) {
        await processUserResponse(msg, appointmentStep);
      } else if (isAppointmentRelated(msg)) {
        fetchSpecialties();
        setShowSpecialtiesDropdown(true);
      } else {
        callFlaskAPI(msg, currentTime);
      }
    }
  };

  const fetchDoctorsForSpecialty = async (specialtyName) => {
    console.log(`Fetching doctors for ${specialtyName}`);
    setSelectedSpecialty({ name: specialtyName });
    setShowDoctors(true);
  };

  const isAppointmentRelated = (message) => {
    const appointmentKeywords = [
      "bghyt nakhod",
      "rendez vous",
      "bghyt ndowz",
      "bghyt nqabbel tabib",
      "kanqalbek 3la rdv",
      "wach mumkin ndowz",
      "bghyt nqabbel doktor",
      "bghyt n7jz",
      "kanqalbek 3la wqt",
      "rdv",
    ];
    return appointmentKeywords.some((keyword) => message.includes(keyword));
  };

  const callFlaskAPI = (userMessage, time) => {
    setIsBotTyping(true); // Set bot typing state to true
    fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, time }),
    })
      .then((response) => response.json())
      .then((data) => {
        displayBotMessage(data.answer);
        if (data.answer.includes("first name")) {
          setAppointmentStep(1);
        }
        setIsBotTyping(false); // Set bot typing state to false after message is displayed
      })
      .catch((error) => {
        console.error("Error:", error);
        displayBotMessage("Une erreur s'est produite, veuillez réessayer.");
        setIsBotTyping(false); // Set bot typing state to false in case of error
      });
  };

  const processUserResponse = async (response, step) => {
    try {
      setIsBotTyping(true); // Set bot typing state to true
      const res = await fetch("http://localhost:5000/process_response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response, step }),
      });
      const data = await res.json();
      if (data.complete) {
        finalizeAppointment();
      } else {
        setBookingDetails((prevDetails) => ({
          ...prevDetails,
          [step === 1 ? "first_name" : step === 2 ? "last_name" : step === 3 ? "phone_number" : "email"]: response,
        }));
        setAppointmentStep(data.next_step);
        const nextQuestion = getNextQuestion(data.next_step);
        displayBotMessage(nextQuestion);
      }
      setIsBotTyping(false); // Set bot typing state to false after message is displayed
    } catch (error) {
      console.error("Error processing response:", error);
      setIsBotTyping(false); // Set bot typing state to false in case of error
    }
  };

  const getNextQuestion = (step) => {
    switch (step) {
      case 1:
        return "Achno smitek?";
      case 2:
        return "Achno knitek?";
      case 3:
        return "3tini ra9m lhatif dyalk?";
      case 4:
        return "Chnahowa l'email dyalk?";
      default:
        return "";
    }
  };

  const finalizeAppointment = async () => {
    try {
        const response = await fetch("http://localhost:5000/save_appointment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                doctorName: bookingDetails.doctorName,
                PcsID: bookingDetails.PcsID,
                timeSlot: bookingDetails.timeSlot,
                first_name: bookingDetails.first_name,
                last_name: bookingDetails.last_name,
                phone_number: bookingDetails.phone_number,
                email: bookingDetails.email,
            }),
        });

        if (!response.ok) throw new Error("Network response was not ok.");

        const data = await response.json();
        displayBotMessage(`t2akad liya mn ma3lomat dyalk.
        Smitek: ${bookingDetails.first_name}, Knitek: ${bookingDetails.last_name}, Ra9m dyalk: ${bookingDetails.phone_number} Email: ${bookingDetails.email} Tbib: ${bookingDetails.doctorName} lwe9t: ${bookingDetails.timeSlot}`);
    } catch (error) {
        console.error("Error finalizing appointment:", error);
        displayBotMessage("w9e3 lina mochkil wakha t3awad mn lwl?.");
    }
  };

  const displayUserMessage = (message, time) => {
    console.log("User Message:", message);
    setMessages((prev) => {
      console.log("Previous Messages Before User Message:", prev); // Debugging
      const newMessages = [...prev, { text: message, type: "user", time }];
      console.log("New Messages After User Message:", newMessages); // Debugging
      return newMessages;
    });
  };

  const displayBotMessage = (message) => {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    console.log("Bot Message:", message);
    setMessages((prev) => {
      console.log("Previous Messages Before Bot Message:", prev); // Debugging
      const newMessages = [...prev, { text: message, type: "bot", time: currentTime }];
      console.log("New Messages After Bot Message:", newMessages); // Debugging
      return newMessages;
    });
  };

  const fetchSpecialties = () => {
    fetch("http://localhost:5000/get_specialties")
      .then((response) => response.json())
      .then((data) => {
        setSpecialties(data["hydra:member"]);
      })
      .catch((error) => {
        console.error("Error fetching specialties:", error);
      });
  };

  // Function to reset the chat
  const resetChat = () => {
    setMessages([]);
    setUserMessage("");
    setSpecialties([]);
    setInitialMessageSet(false);
    setShowSpecialtiesDropdown(false);
    setSelectedSpecialty(null);
    setShowDoctors(false);
    setAppointmentStep(0);
    setBookingDetails({});
  };

  // Function to stop the bot typing
  const stopBotTyping = () => {
    setForceStopTyping(true);
    setIsBotTyping(false); // Stop bot typing
  };

  useEffect(() => {
    if (forceStopTyping) {
      const timer = setTimeout(() => setForceStopTyping(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [forceStopTyping]);

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end">
      <button
        onClick={toggleChatBox}
        className="bg-picton-blue-500 hover:bg-persian-green-600 text-white font-bold py-2 px-4 rounded-full"
      >
        <IoChatbubbles className="text-xl w-16 h-8" />
      </button>
      {isOpen && (
        <div className="bg-black-squeeze w-80 h-96 flex flex-col justify-between rounded-xl fixed bottom-14 right-18">
          <div
            style={{
              backgroundImage:
                "linear-gradient(to right, #00AEEF, #00ABC6, #00AAB1, #00A99D)",
            }}
            className="min-h-12 w-full rounded-t-xl flex justify-between items-center py-4 px-4"
          >
            <button className="h-6 w-24">
              <img src="logo.png" alt="logo" />
            </button>
            <div className="flex items-center">
              <button
                onClick={resetChat}
                className="bg-transparent p-2"
                title="Rafraîchir le chat"
              >
                <IoRefresh className="text-xl text-white hover:text-gray-300" />
              </button>
              <button onClick={toggleChatBox}>
                <IoCloseOutline className="text-white h-8 w-8" />
              </button>
            </div>
          </div>

          <div
            className="p-3 overflow-y-auto max-h-80 hide-scrollbar"
            style={{ minHeight: "300px" }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat ${
                  msg.type === "user" ? "chat-end" : "chat-start"
                } my-1`}
              >
                <div className="chat-image avatar">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src="avatar.png" alt="User Avatar" />
                  </div>
                </div>
                <div className="chat-header">{msg.name}</div>
                <div
                  className="chat-bubble text-sm p-2 text-black"
                  style={{
                    backgroundColor: msg.type === "user" ? "#CBF8F5" : "#CEF0FC",
                    maxWidth: "75%",
                  }}
                >
                  {msg.type === "bot" ? (
                    <AniText msg={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>
                <div className="chat-footer text-xs opacity-50">
                  {msg.type === "user" ? `Seen at ${msg.time}` : `Delivered ${msg.time}`}
                </div>
              </div>
            ))}

            {isBotTyping && !forceStopTyping && (
              <div className="chat chat-start my-1">
                <div className="chat-image avatar">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src="bot-avatar.png" alt="Bot Avatar" />
                  </div>
                </div>
                <div className="chat-bubble text-sm p-2 text-black" style={{ backgroundColor: "#CEF0FC", maxWidth: "75%" }}>
                  <div className="typing-indicator" style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="typing-dot" style={{ width: '8px', height: '8px', margin: '0 2px', backgroundColor: '#333', borderRadius: '50%', animation: 'typing 1s infinite' }}></div>
                    <div className="typing-dot" style={{ width: '8px', height: '8px', margin: '0 2px', backgroundColor: '#333', borderRadius: '50%', animation: 'typing 1s infinite 0.2s' }}></div>
                    <div className="typing-dot" style={{ width: '8px', height: '8px', margin: '0 2px', backgroundColor: '#333', borderRadius: '50%', animation: 'typing 1s infinite 0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {showSpecialtiesDropdown && (
              <SpecialtiesDropdown
                specialties={specialties}
                fetchDoctorsForSpecialty={fetchDoctorsForSpecialty}
              />
            )}
            {showDoctors && selectedSpecialty && (
              <Doctor
                specialty={selectedSpecialty.name}
                onSlotClick={(doctorName, PcsID, slot) => {
                  setBookingDetails({ doctorName, PcsID, timeSlot: slot });
                  displayBotMessage(
                    `Chokran 7it khtariti ${doctorName} m3a ${slot}. 3tini smitek 3afak.`
                  );
                  setShowSpecialtiesDropdown(false);
                  setShowDoctors(false);
                  setAppointmentStep(1);
                }}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center justify-end w-full  rounded-full shadow-inner px-4 bg-white ">
            <input
              type="text"
              placeholder="Type a message..."
              className="pl-4 pr-10 py-2 w-full rounded bg-white focus:border-none focus:outline-none"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyUp={(e) => e.key === "Enter" && handleUserInput()}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleUserInput}
              className="bg-persian-green-500 hover:bg-teal-600 text-white text-m rounded-full p-2 mr-2 flex items-center justify-center gap-1 focus:outline-none focus:border-picton-blue-500 focus:border-2"
            >
              {isBotTyping || forceStopTyping ? (
                <IoSquare className="text-xl" onClick={stopBotTyping} />
              ) : (
                <IoSend className="text-xs" />
              )}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
