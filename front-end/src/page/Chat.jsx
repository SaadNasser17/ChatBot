import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import {
  IoChatbubbleEllipsesOutline,
  IoChatbubbles,
} from "react-icons/io5";
import { getMessageForLanguage } from "../utils/messages.js";
import { useBooking } from "../components/BookingContext";

import ChatHeader from "../components/ChatHeader";
import MessagesList from "../components/MessagesList ";
import ChatFooter from "../components/ChatFooter";
import {
  medicalWords,
  languageChoices,
  generateRandomEmail,
  formatDateWithLatinNumbers,
  confirmYes,
  BookingDetailsData,
  arabicToLatinNumbers,
  actionWords,
  appointmentKeywords,
} from "../utils/ChatFunction";

arabicToLatinNumbers;
formatDateWithLatinNumbers;
languageChoices;

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
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const messagesEndRef = useRef(null);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [waitingForSmsCode, setWaitingForSmsCode] = useState(false);
  const [appointmentRef, setAppointmentRef] = useState(null);
  const [showSendIcon, setShowSendIcon] = useState(true);
  const [isExtended, setIsExtended] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    if (!initialMessageSet) {
      displayBotMessage(
        `Ana NabadyBot, khtar logha dyalek. <br/> 1. Darija <br/> 2. الدارجة <br/> 3. العربية <br/> 4.Francais <br/> 5.English`
      );
      setInitialMessageSet(true);
      incrementSessionCounter(); // New function call
    }
    setWaitingForConfirmation(false);
  }, [initialMessageSet]);


  const toggleChatBox = () => {
    setIsOpen(!isOpen);
    setShowBanner(false)
  };
  const toggleChatSize = () => {
    setIsExtended(!isExtended);
  };

  const handleUserInput = async () => {
    if (userMessage.trim()) {
      const msg = userMessage.trim().toLowerCase();
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      displayUserMessage(userMessage.trim(), currentTime);
      setUserMessage("");

      if (!selectedLanguage) {
        if (languageChoices[msg]) {
          setSelectedLanguage(languageChoices[msg]);
          console.log("Selected language:", languageChoices[msg]);
          displayBotMessage(
            getMessageForLanguage(languageChoices[msg], "welcome")
          );
        } else {
          displayBotMessage("3afak khtar logha!");
        }
        return;
      }

      if (appointmentStep === 0 && isAppointmentRelated(msg)) {
        displayBotMessage(
          getMessageForLanguage(selectedLanguage, "select_specialty")
        );
        fetchSpecialties();
        setShowSpecialtiesDropdown(true);
      } else {
        if (waitingForSmsCode) {
          handleSmsCodeInput(msg);
        } else if (waitingForConfirmation) {
          handleConfirmation(msg);
        } else if (appointmentStep > 0) {
          await processUserResponse(msg);
        } else {
          callFlaskAPI(msg, currentTime);
        }
      }
    }
    setShowSendIcon(false);
  };

  const isAppointmentRelated = (message) => {
    appointmentKeywords;
    actionWords;
    medicalWords;

    const processedMessage = message
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s{2,}/g, " ");

    const words = processedMessage.split(" ");

    const hasAppointmentKeyword = appointmentKeywords.some((keyword) =>
      processedMessage.includes(keyword.toLowerCase())
    );

    const hasActionMedicalCombination =
      words.some((word) => actionWords.includes(word.toLowerCase())) &&
      words.some((word) => medicalWords.includes(word.toLowerCase()));

    const hasArabicAppointmentWord = /موعد|حجز|طبيب|دكتور/.test(
      processedMessage
    );

    return (
      hasAppointmentKeyword ||
      hasActionMedicalCombination ||
      hasArabicAppointmentWord
    );
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const processUserResponse = async (response) => {
    try {
      switch (appointmentStep) {
        case 1:
          setBookingDetails((prevDetails) => ({
            ...prevDetails,
            first_name: response,
          }));
          displayBotMessage(
            getMessageForLanguage(selectedLanguage, "last_name")
          );
          setAppointmentStep(2);
          break;

        case 2:
          setBookingDetails((prevDetails) => ({
            ...prevDetails,
            last_name: response,
          }));
          displayBotMessage(
            getMessageForLanguage(selectedLanguage, "phone_number")
          );
          setAppointmentStep(3);
          break;

        case 3:
          setBookingDetails((prevDetails) => ({
            ...prevDetails,
            phone_number: response,
          }));

          const timePart = bookingDetails.timeSlot.substring(11, 16);
          const appointmentDate = new Date(bookingDetails.timeSlot);
          const dayPart = formatDateWithLatinNumbers(appointmentDate);

          const confirmationMessage = getMessageForLanguage(
            selectedLanguage,
            "confirmation"
          )
            .replace("${first_name}", bookingDetails.first_name)
            .replace("${last_name}", bookingDetails.last_name)
            .replace("${phone_number}", response)
            .replace("${doctorName}", bookingDetails.doctorName)
            .replace("${timePart}", timePart)
            .replace("${dayPart}", dayPart);

          displayBotMessage(confirmationMessage);
          await delay(10500);
          displayBotMessage(getMessageForLanguage(selectedLanguage, "confirm"));
          await delay(4500);
          setWaitingForConfirmation(true);
          break;

        default:
          displayBotMessage(getMessageForLanguage(selectedLanguage, "default"));
          break;
      }
    } catch (error) {
      console.error("Error processing user response:", error);
      displayBotMessage(getMessageForLanguage(selectedLanguage, "error"));
    }
  };

  const handleConfirmation = async (confirmation) => {
    setWaitingForConfirmation(false);
    confirmYes;

    if (confirmation.trim().toLowerCase() === confirmYes[selectedLanguage]) {
      await finalizeAppointment();
    } else {
      displayBotMessage(
        getMessageForLanguage(selectedLanguage, "retry_first_name")
      );
      setBookingDetails((prevDetails) => ({
        ...prevDetails,
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
      }));
      setAppointmentStep(1);
    }
  };

  const finalizeAppointment = async () => {
    try {
      const randomEmail = generateRandomEmail();
      setGeneratedEmail(randomEmail);

      setBookingDetails((prevDetails) => ({
        ...prevDetails,
        email: randomEmail,
      }));

      await new Promise((resolve) => setTimeout(resolve, 0));

      const response = await fetch("http://127.0.0.1:5000/register_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: bookingDetails.first_name,
          last_name: bookingDetails.last_name,
          phone_number: bookingDetails.phone_number,
          email: randomEmail,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok.");

      const data = await response.json();
      const patientId = data.patient_id;
      const gpatientId = data.gpatient_id;

      console.log("Patient ID:", patientId, "GPatient ID:", gpatientId);

      if (patientId && gpatientId) {
        await saveAppointmentDetails(patientId, gpatientId);
      } else {
        console.error("Patient ID or GPatient ID not found in the response.");
        displayBotMessage(getMessageForLanguage(selectedLanguage, "error"));
      }
    } catch (error) {
      console.error("Error finalizing appointment:", error);
      displayBotMessage(getMessageForLanguage(selectedLanguage, "error"));
    }
  };

  const saveAppointmentDetails = async (patientId, gpatientId) => {
    try {
      const response = await fetch("http://localhost:5000/save_appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingDetails,
          patientId,
          gpatientId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to save appointment details: ${errorData.error || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      setAppointmentRef(data.ref);
      displayBotMessage(getMessageForLanguage(selectedLanguage, "sms_code"));
      setWaitingForSmsCode(true);
    } catch (error) {
      console.error("Error saving appointment details:", error);
      displayBotMessage(getMessageForLanguage(selectedLanguage, "error"));
    }
  };

  const handleSmsCodeInput = async (code) => {
    try {
      const response = await fetch(
        "http://localhost:5000/confirm_appointment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            ref: appointmentRef,
          }),
        }
      );

      if (response.status === 404) {
        throw new Error("Invalid OTP");
      }

      if (!response.ok)
        throw new Error(
          getMessageForLanguage(selectedLanguage, "confirm_error")
        );

      displayBotMessage(
        getMessageForLanguage(selectedLanguage, "confirm_success")
      );
      resetAppointmentDetails();
      setAppointmentStep(0);
      setWaitingForSmsCode(false);
    } catch (error) {
      console.error("Error confirming appointment:", error);
      if (error.message === "Invalid OTP") {
        displayBotMessage(
          getMessageForLanguage(selectedLanguage, "invalid_code")
        );
      } else {
        displayBotMessage(
          getMessageForLanguage(selectedLanguage, "confirm_error")
        );
      }
    }
  };

  const fetchDoctorsForSpecialty = async (specialtyName) => {
    console.log(`Fetching doctors for ${specialtyName}`);
    setSelectedSpecialty({ name: specialtyName });
    setShowDoctors(true);
  };

  const callFlaskAPI = (userMessage, time) => {
    setIsBotTyping(true);
    fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, time, language: selectedLanguage }),
    })
      .then((response) => response.json())
      .then((data) => {
        displayBotMessage(data.answer);
        if (data.answer.includes("first name")) {
          setAppointmentStep(1);
        }
        setIsBotTyping(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        displayBotMessage(getMessageForLanguage(selectedLanguage, "error"));
        setIsBotTyping(false);
      });
  };

  const generateRandomEmail = () => {
    const randomChars = Math.random().toString(36).substring(2, 10);
    return `${randomChars}@yopmail.com`;
  };

  const addMessage = (text, type) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text, type, time: new Date().toLocaleTimeString() },
    ]);
  };
  const resetAppointmentDetails = () => {
    setBookingDetails({
      BookingDetailsData
    });
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
        console.log("Error fetching specialties:", error);
      });
  };

  const resetChat = () => {
    setMessages([]);
    setUserMessage("");
    setSpecialties([]);
    setInitialMessageSet(false);
    setShowSpecialtiesDropdown(false);
    setSelectedSpecialty(null);
    setShowDoctors(false);
    setAppointmentStep(0);
    resetAppointmentDetails();
    setWaitingForConfirmation(false);
    setWaitingForSmsCode(false);
    setAppointmentRef(null);
    setSelectedLanguage(null);
    setIsBotTyping(false);
    setForceStopTyping(false);
    setShowSendIcon(true);
  };

  const stopBotTyping = () => {
    setIsBotTyping(false);
    setForceStopTyping(true);
    setShowSendIcon(true);
  };

  useEffect(() => {
    if (forceStopTyping) {
      const timer = setTimeout(() => setForceStopTyping(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [forceStopTyping]);
  return (

      <div className="position-fixed bottom-0 end-0 mb-3 me-3 d-flex flex-column align-items-end">
        {showBanner && (
          <div className="chat-banner slide-in-right">
         
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
        )}
  
        {!isOpen && (
          <div className="btn-chat-container">
            <button onClick={toggleChatBox} className="btn-chat-rectangle">
              <IoChatbubbleEllipsesOutline
                className="icon"
                style={{ width: "2.5rem", height: "2.5rem" }}
              />
            </button>
          </div>
        )}

      

      {isOpen && (
        <div
          className="bg-light d-flex flex-column justify-content-between rounded shadow"
          style={{
            width: isExtended ? "35vw" : "390px",
            height: isExtended ? "75vh" : "480px",
            position: "fixed",
            bottom: "5rem",
            right: "1rem",
            transition: "all 0.3s ease-in-out",
          }}
        >
          <ChatHeader
            isExtended={isExtended}
            toggleChatSize={toggleChatSize}
            toggleChatBox={toggleChatBox}
            resetChat={resetChat}
          />

          <MessagesList
            messages={messages}
            isBotTyping={isBotTyping}
            forceStopTyping={forceStopTyping}
            messagesEndRef={messagesEndRef}
            showSpecialtiesDropdown={showSpecialtiesDropdown}
            specialties={specialties}
            fetchDoctorsForSpecialty={fetchDoctorsForSpecialty}
            selectedLanguage={selectedLanguage}
            showDoctors={showDoctors}
            selectedSpecialty={selectedSpecialty}
            setBookingDetails={setBookingDetails}
            displayBotMessage={displayBotMessage}
            formatDateWithLatinNumbers={formatDateWithLatinNumbers}
            setShowSpecialtiesDropdown={setShowSpecialtiesDropdown}
            setShowDoctors={setShowDoctors}
            setAppointmentStep={setAppointmentStep}
            waitingForConfirmation={waitingForConfirmation}
            handleConfirmation={handleConfirmation}
          />

          <ChatFooter
            userMessage={userMessage}
            setUserMessage={setUserMessage}
            handleUserInput={handleUserInput}
            stopBotTyping={stopBotTyping}
            showSendIcon={showSendIcon}
          />
        </div>
      )}
    </div>

  )
}