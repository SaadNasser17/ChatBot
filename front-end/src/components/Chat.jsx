// Chat.jsx

import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import { IoChatbubbles, IoCloseOutline, IoSend, IoRefresh, IoSquare } from "react-icons/io5";
import SpecialtiesDropdown from "./SpecialtiesDropdown";
import Doctor from "./Doctor";
import { motion } from "framer-motion";
import { useBooking } from './BookingContext';
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
  const [showMotifs, setShowMotifs] = useState(false);
  const [motifs, setMotifs] = useState([]);
  const [selectedMotif, setSelectedMotif] = useState(null);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const messagesEndRef = useRef(null);
  const [generatedEmail, setGeneratedEmail] = useState('');

  useEffect(() => {
    if (!initialMessageSet) {
      displayBotMessage(`Ana NabadyBot, Bach ne9der n3awnek?<br />أنا نابادي بوت، باش نقدر نعاونك؟`);
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
  
      if (waitingForConfirmation) {
        handleConfirmation(msg);
      } else if (appointmentStep === 3) {
        setBookingDetails((prevDetails) => ({
          ...prevDetails,
          phone_number: msg,
        }));
        await processUserResponse(msg);
      } else if (appointmentStep > 0) {
        await processUserResponse(msg);
      } else if (isAppointmentRelated(msg)) {
        fetchSpecialties();
        setShowSpecialtiesDropdown(true);
      } else {
        callFlaskAPI(msg, currentTime);
      }
    }
  };

  const processUserResponse = async (response) => {
    try {
      switch (appointmentStep) {
        case 1:
          setBookingDetails({ ...bookingDetails, first_name: response });
          displayBotMessage("Achno ism 3a2ili dyalk?");
          setAppointmentStep(2);
          break;

        case 2:
          setBookingDetails({ ...bookingDetails, last_name: response });
          displayBotMessage("3tini ra9m lhatif dyalk?");
          setAppointmentStep(3);
          break;

        case 3:
          setBookingDetails((prevDetails) => ({
            ...prevDetails,
            phone_number: response
          }));
          const confirmationMessage = `t2akad liya mn ma3lomat dyalk. Smitek: ${bookingDetails.first_name}, Knitek: ${bookingDetails.last_name}, Ra9m dyalk: ${response}, Tbib: ${bookingDetails.doctorName}, lwe9t: ${bookingDetails.timeSlot}`;
          displayBotMessage(confirmationMessage);
          displayBotMessage("Ah wlla la?");
          setWaitingForConfirmation(true);
          break;

        default:
          displayBotMessage("Ma fhmtsh, 3afak 3awd ghi mra.");
          break;
      }
    } catch (error) {
      console.error("Error processing user response:", error);
      displayBotMessage("w9e3 lina mochkil, wakha t3awad mn lwl?");
    }
  };

  const handleConfirmation = async (confirmation) => {
    if (confirmation === "ah") {
      await finalizeAppointment();
      setWaitingForConfirmation(false);
    } else {
      displayBotMessage("Okay, let's start over with your first name.");
      resetAppointmentDetails();
      setAppointmentStep(1);
      setWaitingForConfirmation(false);
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

      const response = await fetch("http://localhost:5000/register_user", {
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
        console.log("Saving appointment with motif ID:", selectedMotif.motifId);
        await saveAppointmentDetails(patientId, gpatientId, selectedMotif.motifId);
        displayBotMessage(`Appointment confirmed with patient ID: ${patientId}`);
      } else {
        console.error("Patient ID or GPatient ID not found in the response.");
        displayBotMessage("An error occurred, please try again.");
      }
    } catch (error) {
      console.error("Error finalizing appointment:", error);
      displayBotMessage("An error occurred, please try again.");
    }
  };


  const saveAppointmentDetails = async (patientId, gpatientId) => {
    try {
      const { motifFamilleId } = selectedMotif;
      console.log("Saving appointment details with motif famille ID:", motifFamilleId);
      const response = await fetch("http://localhost:5000/save_appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingDetails,
          patientId,
          gpatientId,
          motifFamilleId,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to save appointment details.");
  
      const data = await response.json();
      console.log("Appointment details saved:", data);
    } catch (error) {
      console.error("Error saving appointment details:", error);
    }
  };

  const fetchDoctorsForSpecialty = async (specialtyName) => {
    console.log(`Fetching doctors for ${specialtyName}`);
    setSelectedSpecialty({ name: specialtyName });
    setShowDoctors(true);
  };

  const isAppointmentRelated = (message) => {
    const appointmentKeywords = [
      "bghyt nakhod maw3id", "bghyt nakhod maou3id", "bghyt ndowz", "bghyt nqabbel tabib",
      "kanqalbek 3la rdv", "wach mumkin ndowz", "bghyt nqabbel doktor",
      "bghyt n7jz", "kanqalbek 3la wqt", "bghit ndir rendez-vous", "bghit ndir rdv", "bghit nakhod rendez vous", "bghit nakhod rendez-vous", "bghit nakhod rdv", "bghit nakhod maw3id", "bghyt nakhod maou3id", "bghyt na7jez maw3id", "bghyt ne7jez maou3id",
      "momkin nji l clinic?", "rdv",
      "bghit n3ayet l doctor", "bghit n3ayet l docteur", "bghit n3ayet l tbib",
      "kayn chi rdv disponible?",
      "bghit nchouf docteur", "bghit nchouf tbib",
      "fin momkin nl9a rdv?", "fin momkin nakhod rdv?",
      "wach momkin nl9a rendez-vous lyoma?",
      "bghit nreserve wa9t m3a tbib",
      "mnin ymkni ndir rendez-vous?",
      "kifach nqder ndir rendez-vous?",
      "momkin te3tini liste dyal tbibes disponibles.", "Kifach nakhod rendez-vous avec le médecin?", "consultation", "بغيت ناخد موعد", "بغيت ندوز", "بغيت نقابل طبيب", "كنقلبك على rendez vous", "كنقلبك على موعد", "بغيت نقابل طبيب", "واش ممكن ندوز", "بغيت نقابل دكتور", "بغيت نحجز", "بغيت نحجز موعد",
      "كنقلبك على وقت", "بغيت ندير rendez-vous", "بغيت ندير rdv", "بغيت ناخد rendez vous", "بغيت ناخد rendez-vous", "بغيت ناخد rdv", "بغيت ناخد موعد", "بغيت نحجز موعد", "بغيت نشوف دكتور", "بغيت نشوف طبيب", "فين ممكن نلقى rendez vous?", "فين ممكن نلقى rendez vous?",
      "فين ممكن نلقى موعد؟", "فين ممكن نلقى rendez vous؟", "واش ممكن نلقى موعد ليوما؟", "بغيت نريزرفي وقت مع طبيب", "ممكن تعطيني ليست ديال طبيب متاحين؟", "موعد"
    ];
    return appointmentKeywords.some((keyword) => message.includes(keyword));
  };

  const callFlaskAPI = (userMessage, time) => {
    setIsBotTyping(true);
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
        setIsBotTyping(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        displayBotMessage("Une erreur s'est produite, veuillez réessayer.");
        setIsBotTyping(false);
      });
  };

  const generateRandomEmail = () => {
    const randomChars = Math.random().toString(36).substring(2, 10);
    return `${randomChars}@yopmail.com`;
  };

  const addMessage = (text, type) => {
    setMessages((prevMessages) => [...prevMessages, { text, type, time: new Date().toLocaleTimeString() }]);
  };

  const resetAppointmentDetails = () => {
    setBookingDetails({
      doctorName: "",
      PcsID: "",
      timeSlot: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      email: "",
      motif: "", // Reset the motif
      motifFamilleId: "" // Reset the motif famille ID
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
    setMessages((prev) => [...prev, { text: message, type: "bot", time: currentTime }]);
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

  
  const fetchMotifs = async (PcsID) => {
    try {
      console.log("Fetching motifs for PcsID:", PcsID);
      const response = await fetch(`http://localhost:5000/get_motifs?PcsID=${PcsID}`);
      console.log("API response status:", response.status);
      if (!response.ok) throw new Error("Network response was not ok.");
      const data = await response.json();
      console.log("Motifs fetched:", data);
      setMotifs(data["hydra:member"]);
      setShowMotifs(true);
    } catch (error) {
      console.error("Error fetching motifs:", error);
    }
  };

  const handleMotifClick = (motifFamilleId, motifId) => {
    console.log("Motif selected:", motifId, motifFamilleId);
    setSelectedMotif({ motifId, motifFamilleId });
    setShowMotifs(false);
    setAppointmentStep(1);
    displayBotMessage("3tini ism chakhsi dyalk 3afak.");
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
  };

  const stopBotTyping = () => {
    setIsBotTyping(false);
    setForceStopTyping(true);
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
        <div className="bg-black-squeeze w-80 h-96 flex flex-col justify-between rounded-xl fixed bottom-20 right-18">
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
                    <AniText msg={msg.text} forceStopTyping={forceStopTyping} />
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
                    `Chokran 7it khtariti ${doctorName} m3a ${slot}. 3tini ism chakhsi dyalk 3afak.`
                  );
                  setShowSpecialtiesDropdown(false);
                  setShowDoctors(false);
                  setAppointmentStep(1);
                }}
                fetchMotifs={fetchMotifs} // Pass the fetchMotifs function
              />
            )}

            {showMotifs && (
              <div className="motifs-container">
                <span className="text-lg bold">3afak khtar sabab dyal lmaw3id:</span>
                {motifs.map((motif) => (
                  <button
                    key={motif.id}
                    onClick={() => handleMotifClick(motif.id, motif.motif.motifFamille.id)}
                    className="btn btn-secondary my-2 mx-1"
                    style={{ minWidth: "50px", padding: "0.25rem 0.5rem" }}
                  >
                    {motif.motif.libelle}
                  </button>
                ))}
              </div>
            )}

            {waitingForConfirmation && (
              <div className="flex justify-center my-2">
                <button
                  onClick={() => handleConfirmation("ah")}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mx-2"
                >
                  Ah
                </button>
                <button
                  onClick={() => handleConfirmation("la")}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-2"
                >
                  La
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center justify-end w-full rounded-full shadow-inner px-4 ">
            <input
              type="text"
              placeholder="Type a message..."
              className="pl-4 pr-10 py-2 bg-black-squeeze w-full rounded bg-white focus:border-none focus:outline-none"
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
              <IoSend className="text-xs" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={stopBotTyping}
              className="bg-persian-green-500 hover:bg-teal-600 text-white text-m rounded-full p-2 flex items-center justify-center gap-1 focus:outline-none focus:border-picton-blue-500 focus:border-2"
            >
              <IoSquare className="text-xs" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
