import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import {
  IoChatbubbles,
  IoCloseOutline,
  IoSend,
  IoRefresh,
  IoSquare,
  IoContract,
  IoExpand,
} from "react-icons/io5";
import SpecialtiesDropdown from "./SpecialtiesDropdown";
import Doctor from "./Doctor";
import { motion } from "framer-motion";
import { useBooking } from "./BookingContext";
import AniText from "./Anitext";
import DOt from "./DOt";

const arabicToLatinNumbers = (str) => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const latinNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return str.replace(/[٠-٩]/g, (char) => latinNumbers[arabicNumbers.indexOf(char)]);
};

const formatDateWithLatinNumbers = (date) => {
  const options = {  day: '2-digit', month: '2-digit' };
  const formattedDate = date.toLocaleDateString('ar-EG', options);
  return arabicToLatinNumbers(formattedDate);
};

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
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [waitingForSmsCode, setWaitingForSmsCode] = useState(false);
  const [appointmentRef, setAppointmentRef] = useState(null);
  const [showSendIcon, setShowSendIcon] = useState(true);
  const [isExtended, setIsExtended] = useState(false);
  const [useArabic, setUseArabic] = useState(false);

  useEffect(() => {
    if (!initialMessageSet) {
        displayBotMessage(
            `Ana NabadyBot, Bach ne9der n3awnek?<br />أنا نابادي بوت، باش نقدر نعاونك؟`
        );
        setInitialMessageSet(true);
    }

    // Resetting the relevant states on component mount
    setShowMotifs(false);
    setWaitingForConfirmation(false);
}, [initialMessageSet]);


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChatBox = () => {
    setIsOpen(!isOpen);
  };
  const toggleChatSize = () => {
    setIsExtended(!isExtended);
  };

  const handleUserInput = async () => {
    if (userMessage.trim()) {
      const msg = userMessage.trim();
      const lowerCaseMsg = msg.toLowerCase(); // Convert to lowercase for consistency
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      displayUserMessage(msg, currentTime);
      setUserMessage("");

      // Determine the language
      if (appointmentStep === 0 && isAppointmentRelated(lowerCaseMsg)) {
        setUseArabic(isArabic(lowerCaseMsg));
        fetchSpecialties();
        setShowSpecialtiesDropdown(true);
      } else {
        if (waitingForSmsCode) {
          handleSmsCodeInput(lowerCaseMsg);
        } else if (waitingForConfirmation) {
          handleConfirmation(lowerCaseMsg);
        } else if (appointmentStep > 0) {
          await processUserResponse(lowerCaseMsg);
        } else {
          callFlaskAPI(lowerCaseMsg, currentTime);
        }
      }
    }
    setShowSendIcon(false);
  };

  const isArabic = (message) => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicRegex.test(message);
  };

  const isAppointmentRelated = (message) => {
    const appointmentKeywords = [
      "bghyt nakhod maw3id", "bghyt nakhod maou3id", "bghyt ndowz", "bghyt nqabbel tabib", "kanqalbek 3la rdv",
      "wach mumkin ndowz", "bghyt nqabbel doktor", "bghyt n7jz", "kanqalbek 3la wqt", "bghit ndir rendez-vous",
      "bghit ndir rdv", "bghit nakhod rendez vous", "bghit nakhod rendez-vous", "bghit nakhod rdv", "bghit nakhod maw3id",
      "bghyt nakhod maou3id", "bghyt na7jez maw3id", "bghyt ne7jez maou3id", "momkin nji l clinic?", "rdv",
      "bghit n3ayet l doctor", "bghit n3ayet l docteur", "bghit n3ayet l tbib", "kayn chi rdv disponible?", "bghit nchouf docteur",
      "bghit nchouf tbib", "fin momkin nl9a rdv?", "fin momkin nakhod rdv?", "wach momkin nl9a rendez-vous lyoma?",
      "bghit nreserve wa9t m3a tbib", "mnin ymkni ndir rendez-vous?", "kifach nqder ndir rendez-vous?", 
      "momkin te3tini liste dyal tbibes disponibles.", "Kifach nakhod rendez-vous avec le médecin?", "consultation",
      "بغيت ناخد موعد", "بغيت ندوز", "بغيت نقابل طبيب", "كنقلبك على rendez vous", "كنقلبك على موعد", "بغيت نقابل طبيب",
      "واش ممكن ندوز", "بغيت نقابل دكتور", "بغيت نحجز", "بغيت نحجز موعد", "كنقلبك على وقت", "بغيت ندير rendez-vous",
      "بغيت ندير rdv", "بغيت ناخد rendez vous", "بغيت ناخد rendez-vous", "بغيت ناخد rdv", "بغيت ناخد موعد", 
      "بغيت نحجز موعد", "بغيت نشوف دكتور", "بغيت نشوف طبيب", "فين ممكن نلقى rendez vous?", "فين ممكن نلقى rendez vous?",
      "فين ممكن نلقى موعد؟", "فين ممكن نلقى rendez vous؟", "واش ممكن نلقى موعد ليوما؟", "بغيت نريزرفي وقت مع طبيب",
      "ممكن تعطيني ليست ديال طبيب متاحين؟", "موعد"
    ];

    const lowerCaseMessage = message.toLowerCase();
    return appointmentKeywords.some((keyword) => lowerCaseMessage.includes(keyword.toLowerCase()));
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const processUserResponse = async (response) => {
    try {
      switch (appointmentStep) {
        case 1:
          setBookingDetails((prevDetails) => ({ ...prevDetails, first_name: response }));
          displayBotMessage(useArabic ? "عافاك عطيني الإسم العائلي ديالك" : "Achno ism 3a2ili dyalk?");
          setAppointmentStep(2);
          break;

        case 2:
          setBookingDetails((prevDetails) => ({ ...prevDetails, last_name: response }));
          displayBotMessage(useArabic ? "عافاك عطيني رقم الهاتف ديالك" : "3tini ra9m lhatif dyalk?");
          setAppointmentStep(3);
          break;

        case 3:
          setBookingDetails((prevDetails) => ({ ...prevDetails, phone_number: response }));

          const timePart = bookingDetails.timeSlot.substring(11, 16);
          const appointmentDate = new Date(bookingDetails.timeSlot);
          const dayPart = formatDateWithLatinNumbers(appointmentDate);

          const confirmationMessage = useArabic
            ? `تأكد من المعلومات  ديالك.<br>${bookingDetails.first_name }: سميتك,<br>${bookingDetails.last_name}:الإسم العائلي ,<br>الهاتف: ${response},<br>${bookingDetails.doctorName}:الطبيب ,<br>الوقت: ${timePart},<br>اليوم: ${dayPart}`
            : `t2akad liya mn ma3lomat dyalk.<br>Smitek: ${bookingDetails.first_name},<br>Knitek: ${bookingDetails.last_name},<br>Ra9m dyalk: ${response},<br>Tbib: ${bookingDetails.doctorName},<br>lwe9t: ${timePart},<br>Nhar: ${dayPart}`;

          displayBotMessage(confirmationMessage);
          await delay(10500); // Delay before showing confirmation message
          displayBotMessage(
            useArabic
              ? " إلا كانت المعلومات صحيحة اضغط على  </br><button>ah</button><br>إلا كانت المعلومات خاطئة اضغط على </br><button>la</button>"
              : "ila lma3lomat s7a7 dghat 3la <button>ah</button> <br>ila lma3lomat ghalat dghat 3la<button>la</button> ?"
          );
          await delay(4500); // Delay before displaying the buttons
          setWaitingForConfirmation(true);
          break;

        default:
          displayBotMessage(useArabic ? "مفهمتش عافاك عاود." : "Ma fhmtsh, 3afak 3awd ghi mra.");
          break;
      }
    } catch (error) {
      console.error("Error processing user response:", error);
      displayBotMessage(useArabic ? "وقع لنا مشكل، من فضلك أعد المحاولة من البداية." : "w9e3 lina mochkil, wakha t3awad mn lwl?");
    }
  };

  const handleConfirmation = async (confirmation) => {
    setWaitingForConfirmation(false);
    if (confirmation === "ah" || confirmation === "نعم") {
      await finalizeAppointment();
    } else {
      displayBotMessage(useArabic ? "حسناً، من فضلك أعد إعطائي اسمك الشخصي." : "wakha 3awd 3tini ism chakhsi dyalk");
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
      } else {
        console.error("Patient ID or GPatient ID not found in the response.");
        displayBotMessage(useArabic ? "وقع خطأ، المرجو إعادة المحاولة." : "An error occurred, please try again.");
      }
    } catch (error) {
      console.error("Error finalizing appointment:", error);
      displayBotMessage(useArabic ? "وقع خطأ، المرجو إعادة المحاولة." : "An error occurred, please try again.");
    }
  };

  const saveAppointmentDetails = async (patientId, gpatientId) => {
    try {
      const { motifId } = selectedMotif;
      console.log("Saving appointment details with motif ID:", motifId);
      const response = await fetch("http://localhost:5000/save_appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingDetails,
          patientId,
          gpatientId,
          motifId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to save appointment details: ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      setAppointmentRef(data.ref);
      displayBotMessage(
        useArabic
          ? "دابا غادي يوصلك واحد الكود في SMS، عافاك أعطيه ليا باش نأكدوا الموعد"
          : "daba ghadi iwaslek wahd l code f sms , 3afak 3tih liya bach nconfirmiw le rdv"
      );
      setWaitingForSmsCode(true);
    } catch (error) {
      console.error("Error saving appointment details:", error);
      displayBotMessage(useArabic ? "سمح لينا كاين شي مشكل" : "Smh lina kayn chi mochkil");
    }
  };

  const handleSmsCodeInput = async (code) => {
    try {
      const response = await fetch("http://localhost:5000/confirm_appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          ref: appointmentRef,
        }),
      });
  
      if (response.status === 404) {
        throw new Error("Invalid OTP");
      }
  
      if (!response.ok) throw new Error(useArabic ? "كان هناك خطأ، الموعد لم يتأكد!" : "Kayn chi mouchkil, lmaw3id mat2ekedch!");
  
      // Display a success message
      displayBotMessage(useArabic ? "الموعد تأكد ليك!" : "lmaw3id t2eked lik!");
  
      // Reset the appointment details and step
      resetAppointmentDetails();
      setAppointmentStep(0);
  
      // Reset the waitingForSmsCode state to allow the chatbot to continue with /predict
      setWaitingForSmsCode(false);
    } catch (error) {
      console.error("Error confirming appointment:", error);
      if (error.message === "Invalid OTP") {
        displayBotMessage(useArabic ? "رمز غير صحيح، من فضلك أدخل الرمز الصحيح الذي وصلك" : "ramz machi s7i7, afak dekhel ramz s7i7 li weslek ");
      } else {
        displayBotMessage(useArabic ? "لم نستطع أخذ موعد لك، من فضلك حاول مرة أخرى!" : "Ma9dernach nakhdo lik maw3id, 7awel mera akhra afak!");
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
        displayBotMessage(useArabic ? "وقع خطأ، المرجو إعادة المحاولة." : "Une erreur s'est produite, veuillez réessayer.");
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
      doctorName: "",
      PcsID: "",
      timeSlot: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      email: "",
      motif: "", // Reset the motif
      motifFamilleId: "", // Reset the motif famille ID
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
        console.error("Error fetching specialties:", error);
      });
  };

  const fetchMotifs = async (PcsID) => {
    try {
      console.log("Fetching motifs for PcsID:", PcsID);
      const response = await fetch(
        `http://localhost:5000/get_motifs?PcsID=${PcsID}`
      );
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

  const handleMotifClick = (motifId, motifFamilleId) => {
    console.log("Motif selected:", motifId, motifFamilleId);
    setSelectedMotif({ motifId, motifFamilleId });
    setShowMotifs(false);
    setAppointmentStep(1);
    displayBotMessage(useArabic ? "عافاك عطيني الإسم الشخصي." : "3tini ism chakhsi dyalk 3afak.");
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
    setShowMotifs(false);  // Reset showMotifs state
    setWaitingForConfirmation(false);  // Reset waitingForConfirmation state
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
    <div className="fixed bottom-5 right-5 flex flex-col items-end">
      <button
        onClick={toggleChatBox}
        className="bg-picton-blue-500 hover:bg-persian-green-600 text-white font-bold py-2 px-4 rounded-full"
      >
        <IoChatbubbles className="text-xl w-16 h-8" />
      </button>

      {isOpen && (
        // header
        <div
          className={`bg-black-squeeze-50 ${
            isExtended ? "w-96 h-[600px]" : "w-80 h-96"
          } flex flex-col justify-between rounded-xl fixed bottom-20 right-18`}
        >
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
                onClick={toggleChatSize}
                className="bg-transparent p-2"
                title={isExtended ? "Minimize Chat" : "Extend Chat"}
              >
                {isExtended ? (
                  <IoContract className="text-xl text-white hover:text-gray-300" />
                ) : (
                  <IoExpand className="text-xl text-white hover:text-gray-300" />
                )}
              </button>
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
          {/*  chat */}
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
                    backgroundColor:
                      msg.type === "user" ? "#CBF8F5" : "#CEF0FC",
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
                  {msg.type === "user"
                    ? `Seen at ${msg.time}`
                    : `Delivered ${msg.time}`}
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
                <div
                  className="chat-bubble text-sm p-2 text-black"
                  style={{ backgroundColor: "#CEF0FC", maxWidth: "75%" }}
                >
                  <DOt />
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
                  const timePart = slot.substring(11, 16);
                  const appointmentDate = new Date(slot);
                  const dayPart = formatDateWithLatinNumbers(appointmentDate);
                  
                  setBookingDetails({ doctorName, PcsID, timeSlot: slot });
                  displayBotMessage(
                    useArabic
                      ? `شكراً حيث اخترتي <br>${doctorName} مع ${timePart}.<br>نهار: ${dayPart}.<br>عافاك اختار سبب ديال الموعد:`
                      : `Chokran 7it khtariti ${doctorName} m3a ${timePart}.<br>Nhar: ${dayPart}.<br>3afak khtar sabab dyal lmaw3id:`
                  );
                  setShowSpecialtiesDropdown(false);
                  setShowDoctors(false);
                  setShowMotifs(true);
                }}
                fetchMotifs={fetchMotifs}
              />
            )}

            {showMotifs && (
              <div className="flex flex-wrap">
                {motifs.map((motif, index) => (
                  <button
                    key={index}
                    onClick={() => handleMotifClick(motif.id, motif.motif.motifFamille.id)}
                    className="bg-persian-green-500 hover:bg-teal-600 text-white text-xs p-2 m-1 rounded-lg w-[calc(50%-10px)]"
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

          {/* Input */}
          <div className="flex items-center justify-end w-full rounded-full mb-5 bg-white shadow-sm border-t-2 px-4">
            <input
              type="text"
              placeholder="Type a message..."
              className="p-2 pr-10 w-full bg-white rounded focus:border-none focus:outline-none"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyUp={(e) => e.key === "Enter" && handleUserInput()}
            />
            <div className="flex items-center gap-1">
              {showSendIcon ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleUserInput}
                  className="bg-persian-green-500 hover:bg-teal-600 text-white text-m rounded-full p-2 flex items-center justify-center gap-1 focus:outline-none focus:border-picton-blue-500 focus:border-2"
                >
                  <IoSend className="text-xs" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={stopBotTyping}
                  className="bg-persian-green-500 hover:bg-teal-600 text-white text-m rounded-full p-2 flex focus:outline-none focus:border-picton-blue-500 focus:border-2"
                >
                  <IoSquare className="text-xs" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
