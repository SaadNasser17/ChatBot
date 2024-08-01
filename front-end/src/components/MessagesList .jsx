import React, { useEffect, useRef } from 'react';
import AniText from "../components/Anitext";
import DOt from "../components/DOt";
import SpecialtiesDropdown from './SpecialtiesDropdown';
import Doctor from './Doctor';
import { getMessageForLanguage } from "../utils/messages.js";

export default function MessagesList({messages,
    isBotTyping,
    forceStopTyping,
    messagesEndRef,
    showSpecialtiesDropdown,
    specialties,
    fetchDoctorsForSpecialty,
    selectedLanguage,
    showDoctors,
    selectedSpecialty,
    setBookingDetails,
    displayBotMessage,
    formatDateWithLatinNumbers,
    setShowSpecialtiesDropdown,
    setShowDoctors,
    setAppointmentStep,
    waitingForConfirmation,
    handleConfirmation,
  }) {
    useEffect(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, [
        messages,
        isBotTyping,
        showSpecialtiesDropdown,
        showDoctors,
        waitingForConfirmation,
      ]);
    
    return (
        <div
        className="overflow-auto p-3"
        style={{ 
          height: 'calc(100% - 6rem)',
          maxHeight: 'calc(75vh - 6rem)'
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`d-flex ${msg.type === "user" ? "flex-row-reverse" : ""} my-1`}
          >
            <div className="d-flex flex-column align-items-center">
              <div className="rounded-circle overflow-hidden" style={{ width: '2rem', height: '2rem' }}>
                <img src={msg.type === "user" ? "avatar.png" : "avatar.png"} alt={`${msg.type} Avatar`} className="w-100 h-100" />
              </div>
            </div>
            <div className={msg.type === "user" ? "me-2" : "ms-2"}>
              <div className="p-2 rounded" style={{ backgroundColor: msg.type === "user" ? "#CBF8F5" : "#CEF0FC", maxWidth: '80%' }}>
                {msg.type === "bot" ? (
                  <AniText msg={msg.text} forceStopTyping={forceStopTyping} />
                ) : (
                  msg.text
                )}
              </div>
              <div className="small text-muted mt-1">
                {msg.type === "user"
                  ? `Seen at ${msg.time}`
                  : `Delivered ${msg.time}`}
              </div>
            </div>
          </div>
        ))}

        {isBotTyping && !forceStopTyping && (
          <div className="d-flex my-1">
            <div className="d-flex flex-column align-items-center">
              <div className="rounded-circle overflow-hidden" style={{ width: '2rem', height: '2rem' }}>
                <img src="bot-avatar.png" alt="Bot Avatar" className="w-100 h-100" />
              </div>
            </div>
            <div className="ms-2 p-2 rounded" style={{ backgroundColor: "#CEF0FC", maxWidth: '75%' }}>
              <DOt />
            </div>
          </div>
        )}

        {showSpecialtiesDropdown && (
          <SpecialtiesDropdown
            specialties={specialties}
            fetchDoctorsForSpecialty={fetchDoctorsForSpecialty}
            selectedLanguage={selectedLanguage}
          />
        )}

        {showDoctors && selectedSpecialty && (
          <Doctor
            specialty={selectedSpecialty.name}
            selectedLanguage={selectedLanguage}
            onSlotClick={(doctorName, PcsID, slot) => {
              const timePart = slot.substring(11, 16);
              const appointmentDate = new Date(slot);
              const dayPart = formatDateWithLatinNumbers(appointmentDate);

              setBookingDetails({ doctorName, PcsID, timeSlot: slot });
              displayBotMessage(
                getMessageForLanguage(selectedLanguage, "confirm_doctor")
                  .replace("${doctorName}", doctorName)
                  .replace("${timePart}", timePart)
                  .replace("${dayPart}", dayPart)
              );
              setShowSpecialtiesDropdown(false);
              setShowDoctors(false);
              setAppointmentStep(1);
            }}
          />
        )}

        {waitingForConfirmation && (
          <div className="d-flex justify-content-center my-2">
            <button
              onClick={() => handleConfirmation(
                selectedLanguage === "darija" ? "ah" :
                selectedLanguage === "francais" ? "oui" :
                selectedLanguage === "english" ? "yes" : "نعم"
              )}
              className="btn btn-success mx-2"
            >
              {selectedLanguage === "darija"
                ? "Ah"
                : selectedLanguage === "francais"
                ? "Oui"
                : selectedLanguage === "english"
                ? "Yes"
                : "نعم"}
            </button>
            <button
              onClick={() => handleConfirmation(
                selectedLanguage === "darija" ? "la" :
                selectedLanguage === "francais" ? "non" :
                selectedLanguage === "english" ? "no" : "لا"
              )}
              className="btn btn-danger mx-2"
            >
              {selectedLanguage === "darija"
                ? "La"
                : selectedLanguage === "francais"
                ? "Non"
                : selectedLanguage === "english"
                ? "No"
                : "لا"}
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    )
}