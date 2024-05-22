import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import { IoChatbubbles, IoCloseOutline, IoSend } from "react-icons/io5";
import SpecialtiesDropdown from "./SpecialtiesDropdown";
import Doctor from "./Doctor";
import Typed from "typed.js";
import { motion } from "framer-motion";
import { useBooking } from "./BookingContext";

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
  const messageRefs = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!initialMessageSet) {
      displayBotMessage("Ana NabadyBot, Bach ne9der n3awnek");
      setInitialMessageSet(true);
    }
  }, [initialMessageSet]);

  useEffect(() => {
    messages.forEach((msg, index) => {
      if (msg.type !== "user" && !messageRefs.current[index]?.typed) {
        const options = {
          strings: [msg.text],
          typeSpeed: 40,
          showCursor: false,
        };
        messageRefs.current[index] = {
          ...messageRefs.current[index],
          typed: new Typed(
            messageRefs.current[index]?.el || document.createElement("span"),
            options
          ),
        };
      }
    });

    return () => {
      messageRefs.current.forEach((ref) => {
        ref?.typed?.destroy();
      });
    };
  }, [messages]);

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
      })
      .catch((error) => {
        console.error("Error:", error);
        displayBotMessage("Une erreur s'est produite, veuillez réessayer.");
      });
  };

  const processUserResponse = async (response, step) => {
    try {
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
    } catch (error) {
      console.error("Error processing response:", error);
    }
  };

  const getNextQuestion = (step) => {
    switch (step) {
      case 1:
        return "What's your first name?";
      case 2:
        return "What's your last name?";
      case 3:
        return "What's your phone number?";
      case 4:
        return "What's your email?";
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
                phone_number: bookingDetails.phone_number
            }),
        });

        if (!response.ok) throw new Error("Network response was not ok.");

        const data = await response.json();
        displayBotMessage(`First Name: ${bookingDetails.first_name} Last Name: ${bookingDetails.last_name} Phone Number: ${bookingDetails.phone_number} Email: ${bookingDetails.email} Doctor: ${bookingDetails.doctorName} Time Slot: ${bookingDetails.timeSlot}`);
    } catch (error) {
        console.error("Error finalizing appointment:", error);
        displayBotMessage("An error occurred while saving the appointment.");
    }
  };

  const displayUserMessage = (message, time) => {
    setMessages((prev) => [...prev, { text: message, type: "user", time }]);
  };

  const displayBotMessage = (message) => {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      { text: message, type: "bot", time: currentTime },
    ]);
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
            <button onClick={toggleChatBox}>
              <IoCloseOutline className="text-white h-8 w-8" />
            </button>
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
                  ref={(el) =>
                    (messageRefs.current[index] = {
                      ...messageRefs.current[index],
                      el,
                    })
                  }
                  className="chat-bubble text-sm p-2 text-black"
                  style={{
                    backgroundColor:
                      msg.type === "user" ? "#CBF8F5" : "#CEF0FC",
                    maxWidth: "75%",
                  }}
                >
                  {msg.text}
                </div>
                <div className="chat-footer text-xs opacity-50">
                  {msg.type === "user" ? `Seen at ${msg.time}` : `Delivered ${msg.time}`}
                </div>
              </div>
            ))}

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
        `You've selected an appointment with ${doctorName} at ${slot}. Please provide your details.`
      );
      setShowSpecialtiesDropdown(false);
      setShowDoctors(false);
      setAppointmentStep(1);
    }}
  />
)}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center justify-end w-full p-2 rounded-full bg-white shadow-inner py- px-4">
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
              Send
              <IoSend className="text-xs" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
