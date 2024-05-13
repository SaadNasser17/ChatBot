import React, { useState, useEffect, useRef } from 'react';

const Chatbox = () => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const messageEndRef = useRef(null);
  const userInputRef = useRef(null);

  useEffect(() => {
    displayBotMessage("Ana NabadyBot, Bach ne9der n3awnek");
  }, []);

  const toggleChatbox = () => {
    setIsActive(!isActive);
  };

  const handleUserInput = (event) => {
    if (event.key === 'Enter' || event.type === 'click') {
      const message = userInputRef.current.value.trim().toLowerCase();
      displayUserMessage(message);
      userInputRef.current.value = '';
      if (isAppointmentRelated(message)) {
        fetchSpecialties();
      } else {
        callFlaskAPI(message);
      }
    }
  };

  const isAppointmentRelated = (message) => {
    const appointmentKeywords = [
      "bghyt nakhod", "rendez vous", "bghyt ndowz", "bghyt nqabbel tabib", 
      "kanqalbek 3la rdv", "wach mumkin ndowz", "bghyt nqabbel doktor", 
      "bghyt n7jz", "kanqalbek 3la wqt", "rdv"
    ];
    return appointmentKeywords.some(keyword => message.includes(keyword));
  };

  const callFlaskAPI = (userMessage) => {
    fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    })
    .then(response => response.json())
    .then(data => {
      displayBotMessage(data.answer);
      if (data.tag === 'specialties') {
        fetchSpecialties();
      }
    })
    .catch(error => {
      console.error('Error:', error);
      displayBotMessage("Une erreur s'est produite, veuillez réessayer.");
    });
  };


  const displayUserMessage = (message) => {
    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    scrollToBottom();
  };

  const displayBotMessage = (message) => {
    setMessages(prev => [...prev, { text: message, sender: 'bot' }]);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className={`chatbox__support ${isActive ? 'chatbox--active' : ''}`}>
      <button className="chatbox__button" onClick={toggleChatbox}>Toggle Chat</button>
      <div className="chatbox__messages">
        {messages.map((msg, index) => (
          <div key={index} className={`messages__item messages__item--${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <input ref={userInputRef} onKeyUp={handleUserInput} id="userMessage" />
      <button id="sendMessage" onClick={handleUserInput}>Send</button>
    </div>
  );
};

export default Chatbox;
