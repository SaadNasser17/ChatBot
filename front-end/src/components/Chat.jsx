import { useEffect, useRef, useState } from "react";
import { IoChatbubbles, IoCloseOutline, IoSend } from "react-icons/io5";
import "../index.css";
import SpecialtiesDropdown from "./SpecialtiesDropdown";
import Doctor from "./Doctor";
import Typed from "typed.js";
export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [initialMessageSet, setInitialMessageSet] = useState(false);
  const [showSpecialtiesDropdown, setShowSpecialtiesDropdown] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [showDoctors, setShowDoctors] = useState(false);

  useEffect(() => {
    if (!initialMessageSet) {
      displayBotMessage("Ana NabadyBot, Bach ne9der n3awnek");
      setInitialMessageSet(true);
    }
  }, [setInitialMessageSet]);
  // const fetchDoctorsForSpecialty = (specialty) => {
  //   setSelectedSpecialty(specialty);
  //   setShowDoctors(true);
  // };

  const toggleChatBox = () => {
    setIsOpen(!isOpen);
  };

  const handleUserInput = () => {
    const msg = userMessage.trim().toLowerCase();
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    displayUserMessage(msg, currentTime);
    setUserMessage("");
    if (isAppointmentRelated(msg)) {
      fetchSpecialties();
      setShowSpecialtiesDropdown(true);
    } else {
      callFlaskAPI(msg, currentTime);
    }
  };
  const fetchDoctorsForSpecialty = (specialtyName) => {
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
        if (data.tag === "specialties") {
          fetchSpecialties();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        displayBotMessage("Une erreur s'est produite, veuillez réessayer.");
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
  return (
    <div className="fixed bottom-5 right-5  flex flex-col items-end ">
      <button
        onClick={toggleChatBox}
        className="bg-picton-blue-500 hover:bg-persian-green-600  text-white font-bold py-2 px-4 rounded-full"
      >
        <IoChatbubbles className="text-xl w-16 h-8  " />
      </button>
      {isOpen && (
        <div className="bg-black-squeeze w-80 h-96   flex flex-col justify-between rounded-xl fixed bottom-14 right-18">
          <div
            style={{
              backgroundImage:
                "linear-gradient(to right, #00AEEF, #00ABC6, #00AAB1, #00A99D)",
            }}
            className="min-h-12 w-full rounded-t-xl flex justify-between items-center px-2"
          >
            <button className="h-6 w-24">
              <img src="logo.png" alt="logo" />
            </button>
            <button onClick={toggleChatBox}>
              <IoCloseOutline className="text-white h-8 w-8" />
            </button>
          </div>

          {/* messaeges */}
          <div className="p-3 overflow-y-auto max-h-80 hide-scrollbar">
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
                  {msg.text}
                </div>
                <div className="chat-footer text-xs opacity-50">
                  {msg.type === "user"
                    ? `Seen at ${msg.time}`
                    : `Delivered${msg.time}`}
                </div>
              </div>
            ))}
            {/* {showSpecialtiesDropdown && (
              <SpecialtiesDropdown
                specialties={specialties}
                fetchDoctorsForSpecialty={(specialty) =>
                  console.log(`Fetching doctors for ${specialty}`)
                }
              />
            )}
            {showDoctors && selectedSpecialty && (
              <Doctor specialty={selectedSpecialty.name} />
            )} */}
            {/* {showSpecialtiesDropdown && (
              <SpecialtiesDropdown specialties={specialties} />
            )} */}
            {showSpecialtiesDropdown && (
              <SpecialtiesDropdown
                specialties={specialties}
                fetchDoctorsForSpecialty={fetchDoctorsForSpecialty}
              />
            )}
            {showDoctors && selectedSpecialty && (
              <Doctor specialty={selectedSpecialty.name} />
            )}
          </div>

          {/* input */}
          <div className="flex items-center justify-end w-full p-2 rounded-full bg-white shadow-inner">
            <input
              type="text"
              placeholder="Type a message..."
              className="pl-4 pr-10 py-2 w-full rounded-full bg-white focus:border-none focus:outline-none"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyUp={(e) => e.key === "Enter" && handleUserInput()}
            />
            <button
              onClick={handleUserInput}
              className="bg-persian-green-500 hover:bg-teal-600 text-white text-m rounded-full p-2 mr-2 flex items-center justify-center gap-1"
            >
              Send
              <IoSend className=" text-xs " />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useEffect, useState } from 'react';
// import { IoChatbubbles, IoCloseOutline, IoSend } from 'react-icons/io5';
// import '../index.css';
// import SpecialtiesDropdown from './SpecialtiesDropdown';
// import Doctor from './Doctor';

// export default function Chat() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [userMessage, setUserMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [specialties, setSpecialties] = useState([]);
//   const [showSpecialtiesDropdown, setShowSpecialtiesDropdown] = useState(false);
//   const [selectedSpecialty, setSelectedSpecialty] = useState(null);
//   const [showDoctors, setShowDoctors] = useState(false);

//   // useEffect(() => {
//   //   if (!initialMessageSet) {
//   //     displayBotMessage("Ana NabadyBot, Bach ne9der n3awnek");
//   //     setInitialMessageSet(true);
//   //   }
//   // }, [setInitialMessageSet]);
//   // Simulated fetching of data
//   useEffect(() => {
//     // Assuming a simple fetch to a local API or static data load
//     fetch("http://localhost:5000/get_initial_message")
//       .then(response => response.json())
//       .then(data => displayBotMessage(data.message))
//       .catch(error => console.error("Failed to fetch initial message:", error));
//   }, []);

//   const fetchDoctorsForSpecialty = (specialty) => {
//     setSelectedSpecialty(specialty);
//     setShowDoctors(true); // Show doctors when a specialty is selected
//   };

//   const toggleChatBox = () => setIsOpen(!isOpen);

//   const handleUserInput = () => {
//     const msg = userMessage.trim().toLowerCase();
//     const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     displayUserMessage(msg, currentTime);
//     setUserMessage('');
//     if (isAppointmentRelated(msg)) {
//       fetchSpecialties();
//       setShowSpecialtiesDropdown(true);
//     } else {
//       callFlaskAPI(msg, currentTime);
//     }
//   };

//   const isAppointmentRelated = (message) => {
//     const appointmentKeywords = ["rendez vous", "appointment", "meeting", "see doctor"];
//     return appointmentKeywords.some(keyword => message.includes(keyword));
//   };

//   const callFlaskAPI = (userMessage, time) => {
//     fetch("http://localhost:5000/predict", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message: userMessage, time })
//     })
//     .then(response => response.json())
//     .then(data => {
//       displayBotMessage(data.answer);
//       if (data.tag === "specialties") {
//         fetchSpecialties();
//       }
//     })
//     .catch(error => {
//       console.error("Error:", error);
//       displayBotMessage("An error occurred, please try again.");
//     });
//   };

//   const displayUserMessage = (message, time) => {
//     setMessages(prev => [...prev, { text: message, type: "user", time }]);
//   };

//   const displayBotMessage = (message) => {
//     const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     setMessages(prev => [...prev, { text: message, type: "bot", time: currentTime }]);
//   };

//   const fetchSpecialties = () => {
//     fetch("http://localhost:5000/get_specialties")
//       .then(response => response.json())
//       .then(data => setSpecialties(data.specialties))
//       .catch(error => console.error("Error fetching specialties:", error));
//   };

//   return (
//     <div className="fixed bottom-5 right-5 flex flex-col items-end">
//       <button onClick={toggleChatBox} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full">
//         <IoChatbubbles className="text-xl" />
//       </button>
//       {isOpen && (
//         <div className="bg-white w-80 h-96 flex flex-col justify-between rounded-xl fixed bottom-14 right-5">
//           <div className="bg-blue-500 min-h-12 w-full rounded-t-xl flex justify-between items-center p-2 text-white">
//             <img src="logo.png" alt="Logo" className="h-6" />
//             <button onClick={toggleChatBox}><IoCloseOutline className="h-8 w-8" /></button>
//           </div>
//           <div className="p-3 overflow-y-auto max-h-80">
//             {messages.map((msg, index) => (
//               <div key={index} className={`message ${msg.type}-message`}>
//                 {msg.text} - <small>{msg.time}</small>
//               </div>
//             ))}
//             {showSpecialtiesDropdown && <SpecialtiesDropdown specialties={specialties} fetchDoctorsForSpecialty={fetchDoctorsForSpecialty} />}
//             {showDoctors && selectedSpecialty && <Doctor specialty={selectedSpecialty} />}
//           </div>
//           <div className="flex items-center p-2 bg-gray-100">
//             <input type="text" value={userMessage} onChange={e => setUserMessage(e.target.value)} onKeyUp={e => e.key === 'Enter' && handleUserInput()} placeholder="Type a message..." className="flex-grow p-2 rounded-full border border-gray-300 focus:outline-none" />
//             <button onClick={handleUserInput} className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"><IoSend /></button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }