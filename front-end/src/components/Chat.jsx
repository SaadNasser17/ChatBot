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
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const latinNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return str.replace(
    /[٠-٩]/g,
    (char) => latinNumbers[arabicNumbers.indexOf(char)]
  );
};

const formatDateWithLatinNumbers = (date) => {
  const options = { day: "2-digit", month: "2-digit" };
  const formattedDate = date.toLocaleDateString("en-GB", options); // Use 'en-GB' for DD/MM/YYYY format
  return arabicToLatinNumbers(formattedDate);
};

const languageChoices = {
  "1": "darija",
  "darija": "darija",
  "2": "الدارجة",
  "الدارجة": "الدارجة",
  "3": "العربية",
  "العربية": "العربية",
  "4": "francais",
  "francais": "francais",
  "5": "english",
  "english": "english",
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
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const messagesEndRef = useRef(null);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [waitingForSmsCode, setWaitingForSmsCode] = useState(false);
  const [appointmentRef, setAppointmentRef] = useState(null);
  const [showSendIcon, setShowSendIcon] = useState(true);
  const [isExtended, setIsExtended] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  useEffect(() => {
    if (!initialMessageSet) {
      displayBotMessage(
        `Ana NabadyBot, khtar logha dyalek. <br/> 1. Darija <br/> 2.الدارجة <br/> 3. العربية <br/> 4.Francais <br/> 5.English`
      );
      setInitialMessageSet(true);
    }

    setWaitingForConfirmation(false);
  }, [initialMessageSet]);

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

  const toggleChatBox = () => {
    setIsOpen(!isOpen);
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
          displayBotMessage(getMessageForLanguage(languageChoices[msg], "welcome"));
        } else {
          displayBotMessage("Mafhemtch t9dr t3awd?");
        }
        return;
      }

      if (appointmentStep === 0 && isAppointmentRelated(msg)) {
        displayBotMessage(getMessageForLanguage(selectedLanguage, "select_specialty"));
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

  const isArabic = (message) => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicRegex.test(message);
  };

  const isAppointmentRelated = (message) => {
    const appointmentKeywords = ['rdv', 'rendez', 'vous', 'موعد', 'appointment', 'booking', 'schedule'];
    const actionWords = ['make', 'book', 'schedule', 'set', 'get', 'need', 'want', 'take', 'nakhod', 'ndir', 'bghit', 'bghyt'];
    const medicalWords = ['doctor', 'physician', 'clinic', 'hospital', 'medical', 'checkup', 'consultation', 'tbib', 'doktor'];

    const processedMessage = message.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') 
      .replace(/\s{2,}/g, ' ');

    const words = processedMessage.split(' ');

    const hasAppointmentKeyword = appointmentKeywords.some(keyword => 
      processedMessage.includes(keyword.toLowerCase())
    );

    const hasActionMedicalCombination = words.some(word => 
      actionWords.includes(word.toLowerCase())
    ) && words.some(word => 
      medicalWords.includes(word.toLowerCase())
    );

    const hasArabicAppointmentWord = /موعد|حجز|طبيب|دكتور/.test(processedMessage);

    return hasAppointmentKeyword || hasActionMedicalCombination || hasArabicAppointmentWord;
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
          displayBotMessage(getMessageForLanguage(selectedLanguage, "last_name"));
          setAppointmentStep(2);
          break;

        case 2:
          setBookingDetails((prevDetails) => ({
            ...prevDetails,
            last_name: response,
          }));
          displayBotMessage(getMessageForLanguage(selectedLanguage, "phone_number"));
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

          const confirmationMessage = getMessageForLanguage(selectedLanguage, "confirmation")
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
    if (confirmation === "نعم" || confirmation === "ah") {
      await finalizeAppointment();
    } else {
      displayBotMessage(getMessageForLanguage(selectedLanguage, "retry_first_name"));
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
          `Failed to save appointment details: ${
            errorData.error || "Unknown error"
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

      displayBotMessage(getMessageForLanguage(selectedLanguage, "confirm_success"));
      resetAppointmentDetails();
      setAppointmentStep(0);
      setWaitingForSmsCode(false);
    } catch (error) {
      console.error("Error confirming appointment:", error);
      if (error.message === "Invalid OTP") {
        displayBotMessage(getMessageForLanguage(selectedLanguage, "invalid_code"));
      } else {
        displayBotMessage(getMessageForLanguage(selectedLanguage, "confirm_error"));
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
      doctorName: "",
      PcsID: "",
      timeSlot: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      email: "",
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
    setSelectedLanguage(null);
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

  const getMessageForLanguage = (language, key) => {
    const messages = {
      welcome: {
        darija: "Ana NabadyBot, bach ne9der n3awnek?",
        "الدارجة": "أنا نابادي بوت، باش نقدر نعاونك؟",
        "العربية": "أنا نابادي بوت، كيف يمكنني مساعدتك؟",
        francais: "Bonjour, je suis NabadyBot, comment puis-je vous aider?",
        english: "Hello, I am NabadyBot, how can I assist you?",
      },
      select_specialty: {
        darija: "hahoma les specialités li kaynin khtar li bghit",
        "الدارجة": "هاهوما الإختصاصات لي كينين ، ختار لي بغيتي",
        "العربية": "ها هي التخصصات المتاحة، اختر ما تريد.",
        francais: "Voici les spécialités disponibles, veuillez choisir.",
        english: "Here are the available specialties, please choose one.",
      },
      last_name: {
        darija: "Achno ism 3a2ili dyalk?",
        "الدارجة": "عافاك عطيني الإسم العائلي ديالك",
        "العربية": "من فضلك، أعطني اسمك العائلي.",
        francais: "Quel est votre nom de famille?",
        english: "What is your last name?",
      },
      phone_number: {
        darija: "3tini ra9m lhatif dyalk?",
        "الدارجة": "عافاك عطيني رقم الهاتف ديالك",
        "العربية": "من فضلك، أعطني رقم هاتفك.",
        francais: "Quel est votre numéro de téléphone?",
        english: "What is your phone number?",
      },
      confirmation: {
        darija: "t2akad liya mn ma3lomat dyalk.<br>Smitek: ${first_name},<br>Knitek: ${last_name},<br>Ra9m dyalk: ${phone_number},<br>Tbib: ${doctorName},<br>lwe9t: ${timePart},<br>Nhar: ${dayPart}",
        "الدارجة": "تأكد من المعلومات  ديالك.<br>${first_name}: سميتك,<br>${last_name}:الإسم العائلي ,<br>الهاتف: ${phone_number},<br>${doctorName}:الطبيب ,<br>الوقت: ${timePart},<br>اليوم: ${dayPart}",
        "العربية": "تأكد من معلوماتك.<br>الاسم: ${first_name},<br>الاسم العائلي: ${last_name},<br>الهاتف: ${phone_number},<br>الطبيب: ${doctorName},<br>الوقت: ${timePart},<br>اليوم: ${dayPart}",
        francais: "Veuillez vérifier vos informations.<br>Prénom: ${first_name},<br>Nom: ${last_name},<br>Téléphone: ${phone_number},<br>Médecin: ${doctorName},<br>Heure: ${timePart},<br>Jour: ${dayPart}",
        english: "Please verify your information.<br>First Name: ${first_name},<br>Last Name: ${last_name},<br>Phone: ${phone_number},<br>Doctor: ${doctorName},<br>Time: ${timePart},<br>Day: ${dayPart}",
      },
      confirm_doctor: {
        darija: "Chokran 7it khtariti ${doctorName} m3a ${timePart}.<br>Nhar: ${dayPart}.<br>3afak 3tini ism chakhsi dyalk.",
        "الدارجة": "شكراً حيث اخترتي <br>${doctorName} مع ${timePart}.<br>نهار: ${dayPart}.<br>عافاك عطيني الإسم الشخصي ديالك.",
        "العربية": "شكراً لاختيارك <br>${doctorName} مع ${timePart}.<br>اليوم: ${dayPart}.<br>من فضلك أعطني اسمك الشخصي.",
        francais: "Merci d'avoir choisi ${doctorName} à ${timePart}.<br>Jour: ${dayPart}.<br>Veuillez me donner votre prénom.",
        english: "Thank you for choosing ${doctorName} at ${timePart}.<br>Day: ${dayPart}.<br>Please provide your first name.",
      },
      confirm: {
        darija: "ila lma3lomat s7i7 dghat 3la <button>ah</button> <br>ila lma3lomat ghalat dghat 3la<button>la</button> ?",
        "الدارجة": "إلا كانت المعلومات صحيحة اضغط على <button>نعم</button><br>إلا كانت المعلومات خاطئة اضغط على <button>لا</button>",
        "العربية": "إذا كانت المعلومات صحيحة اضغط على <button>نعم</button><br>إذا كانت المعلومات خاطئة اضغط على <button>لا</button>",
        francais: "Si les informations sont correctes, cliquez sur <button>oui</button><br>Si les informations sont incorrectes, cliquez sur <button>non</button>",
        english: "If the information is correct, click <button>yes</button><br>If the information is incorrect, click <button>no</button>",
      },
      retry_first_name: {
        darija: "wakha 3awd 3tini ism chakhsi dyalk",
        "الدارجة": "حسناً، من فضلك أعد إعطائي اسمك الشخصي.",
        "العربية": "حسناً، من فضلك أعد إعطائي اسمك الشخصي.",
        francais: "D'accord, veuillez me redonner votre prénom.",
        english: "Alright, please provide your first name again.",
      },
      sms_code: {
        darija: "daba ghadi iwaslek wahd ramz f sms , 3afak 3tih liya bach lmaw3id it2eked lik",
        "الدارجة": "دابا غادي يوصلك واحد الرمز في SMS، عافاك أعطيه ليا باش نأكدوا الموعد",
        "العربية": "سيصلك رمز في رسالة نصية، من فضلك أعطني إياه لتأكيد الموعد.",
        francais: "Vous allez recevoir un code par SMS, veuillez me le donner pour confirmer le rendez-vous.",
        english: "You will receive a code via SMS, please provide it to confirm the appointment.",
      },
      confirm_success: {
        darija: "lmaw3id t2eked lik!",
        "الدارجة": "الموعد تأكد ليك!",
        "العربية": "تم تأكيد موعدك!",
        francais: "Votre rendez-vous a été confirmé!",
        english: "Your appointment has been confirmed!",
      },
      invalid_code: {
        darija: "ramz machi s7i7, afak dekhel ramz s7i7 li weslek",
        "الدارجة": "رمز غير صحيح، من فضلك أدخل الرمز الصحيح الذي وصلك",
        "العربية": "الرمز غير صحيح، من فضلك أدخل الرمز الصحيح.",
        francais: "Code incorrect, veuillez entrer le code correct.",
        english: "Invalid code, please enter the correct code.",
      },
      confirm_error: {
        darija: "Kayn chi mouchkil, lmaw3id mat2ekedch!",
        "الدارجة": "كان هناك خطأ، الموعد لم يتأكد!",
        "العربية": "حدث خطأ، الموعد لم يتم تأكيده!",
        francais: "Une erreur est survenue, le rendez-vous n'a pas été confirmé!",
        english: "An error occurred, the appointment was not confirmed!",
      },
      error: {
        darija: "An error occurred, please try again.",
        "الدارجة": "وقع خطأ، المرجو إعادة المحاولة.",
        "العربية": "وقع خطأ، المرجو إعادة المحاولة.",
        francais: "Une erreur s'est produite, veuillez réessayer.",
        english: "An error occurred, please try again.",
      },
      default: {
        darija: "Ma fhmtsh, 3afak 3awd ghi mra.",
        "الدارجة": "مفهمتش عافاك عاود.",
        "العربية": "لم أفهم، من فضلك أعد المحاولة.",
        francais: "Je n'ai pas compris, veuillez réessayer.",
        english: "I didn't understand, please try again.",
      },
    };
    return messages[key][language];
  };

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end">
      {!isOpen && (
        <button
          onClick={toggleChatBox}
          className="bg-picton-blue-500 hover:bg-persian-green-600 text-white font-bold py-2 px-4 rounded-full"
        >
          <IoChatbubbles className="text-xl w-16 h-8" />
        </button>
      )}

      {isOpen && (
        <div
          className={`bg-black-squeeze-50 ${
            isExtended ? "w-[30vw] h-[80vh] " : "w-80 h-96"
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
          <div
            className={`${
              isExtended ? "w-[30vw] h-[80vh]" : "w-80 h-96"
            } p-3 overflow-y-auto max-h-96 hide-scrollbar`}
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
              <div className="flex justify-center my-2">
                <button
                  onClick={() => handleConfirmation("نعم")}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mx-2"
                >
                  نعم
                </button>
                <button
                  onClick={() => handleConfirmation("لا")}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-2"
                >
                  لا
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            className={`bg-white ${
              isExtended ? "w-full h-[50px]" : "w-80 h-96"
            }  flex items-center justify-end rounded-full mb-5  shadow-sm border-t-2 px-4`}
          >
            <input
              type="text"
              placeholder="Type a message..."
              className={`bg-white p-2  w-full rounded-full focus:border-none focus:outline-none ${
                isExtended ? "h-[50px]" : "h-10"
              }`}
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyUp={(e) => e.key === "Enter" && handleUserInput()}
            />
            <div className="flex items-center gap-1 mt-2">
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
