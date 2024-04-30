document.addEventListener('DOMContentLoaded', () => {
  class Chatbox {
    constructor() {
      this.args = {
        openButton: document.querySelector('.chatbox__button'),
        chatbox: document.querySelector('.chatbox__support'),
        sendButton: document.querySelector('#sendMessage'),
        textfield: document.querySelector('#userMessage'),
        chatMessages: document.querySelector('.chatbox__messages')
      };
      this.state = false;
      this.messages = [];
      this.specialties = [];
      this.initializeChat();
    }

    initializeChat() {
      this.args.openButton.addEventListener('click', () => this.toggleState());
      this.args.sendButton.addEventListener('click', () => this.handleUserInput());
      this.args.textfield.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          this.handleUserInput();
        }
      });
      this.displayBotMessage("Ana NabadyBot, Bach ne9der n3awnek");
    }

    toggleState() {
      this.state = !this.state;
      this.args.chatbox.classList.toggle('chatbox--active', this.state);
    }

    handleUserInput() {
      const userMessage = this.args.textfield.value.trim().toLowerCase();
      this.displayUserMessage(userMessage);
      this.args.textfield.value = '';
      if (this.isAppointmentRelated(userMessage)) {
        this.fetchSpecialties();
      } else {
        this.callFlaskAPI(userMessage);
      }
    }

    isAppointmentRelated(message) {
      const appointmentKeywords = [
        "bghyt nakhod", "rendez vous", "bghyt ndowz", "bghyt nqabbel tabib", 
        "kanqalbek 3la rdv", "wach mumkin ndowz", "bghyt nqabbel doktor", 
        "bghyt n7jz", "kanqalbek 3la wqt", "rdv"
      ];
      return appointmentKeywords.some(keyword => message.includes(keyword));
    }

    callFlaskAPI(userMessage) {
      fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })
      .then(response => response.json())
      .then(data => {
        this.displayBotMessage(data.answer);
        if (data.tag === 'specialties') {
          this.fetchSpecialties();
        }
      })
      .catch(error => {
        console.error('Error:', error);
        this.displayBotMessage("Une erreur s'est produite, veuillez réessayer.");
      });
    }

    displayUserMessage(message) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('messages__item', 'messages__item--operator');
      messageDiv.innerHTML = message;
      this.args.chatMessages.appendChild(messageDiv);
      this.args.chatMessages.scrollTop = this.args.chatMessages.scrollHeight;
    }

    displayBotMessage(message) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('messages__item', 'messages__item--visitor');
      messageDiv.innerHTML = message;
      this.args.chatMessages.appendChild(messageDiv);
      this.args.chatMessages.scrollTop = this.args.chatMessages.scrollHeight;
    }

    fetchSpecialties() {
      fetch('/get_specialties')
      .then(response => response.json())
      .then(data => {
        this.specialties = data['hydra:member'];
        this.displaySpecialtiesDropdown();
      })
      .catch(error => {
        console.error('Error fetching specialties:', error);
      });
    }

    displaySpecialtiesDropdown() {
      const selectList = document.createElement('select');
      selectList.id = 'specialtySelect';
      selectList.innerHTML = `<option value="">Khtar ina tib bghiti </option>` +
        this.specialties.map(spec => `<option value="${spec.name}">${spec.name}</option>`).join('');
      selectList.addEventListener('change', (event) => {
        const specialtyName = event.target.value;
        this.fetchDoctorsForSpecialty(specialtyName);
      });
      const selectContainer = document.createElement('div');
      selectContainer.classList.add('select-container');
      selectContainer.appendChild(selectList);
      this.args.chatMessages.appendChild(selectContainer);
      this.args.chatMessages.scrollTop = this.args.chatMessages.scrollHeight;
    }

    fetchDoctorsForSpecialty(specialtyName) {
      fetch('https://apiuat.nabady.ma/api/users/medecin/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "query": specialtyName, "consultation": "undefined", "page": 1, "result": 5, "isIframe": false, "referrer": "" })
      })
      .then(response => response.json())
      .then(data => {
        this.displayDoctors(data.praticien.data);
      })
      .catch(error => {
        console.error('Error fetching doctors:', error);
      });
    }

    displayDoctors(doctorData) {
      const container = this.args.chatMessages;
      container.innerHTML = '';
      doctorData.forEach(item => {
        const doctor = item["0"];
        const doctorName = `Dr. ${doctor.lastname} ${doctor.firstname}`; // Ensure doctorName is defined here
        let doctorInfo = `
          <div class='doctor-info'>
            <strong>${doctorName}</strong><br>
            Tel: ${doctor.tel}<br>
            Email: <a href='mailto:${doctor.email}'>${doctor.email}</a><br>
            Address: ${doctor.adresse}<br>
          </div>`;
        const agendaConfig = doctor.praticienCentreSoins[0].agendaConfig;
        doctorInfo += this.createAgendaGrid(agendaConfig, doctorName); // Pass doctorName here
        container.innerHTML += doctorInfo;
      });
    }
    
    createAgendaGrid(agendaConfig, doctorName) {
      let gridHtml = `<div class='agenda-grid'>`;
      const openingHour = parseInt(agendaConfig.heureOuverture.split(':')[0], 10);
      const openingMinute = parseInt(agendaConfig.heureOuverture.split(':')[1], 10);
      const closingHour = parseInt(agendaConfig.heureFermeture.split(':')[0], 10);
      const closingMinute = parseInt(agendaConfig.heureFermeture.split(':')[1], 10);
      const granularityMinutes = parseInt(agendaConfig.granularite.split(':')[1], 10);
    
      let slotHour = openingHour;
      let slotMinute = openingMinute;
    
      while (slotHour < closingHour || (slotHour === closingHour && slotMinute < closingMinute)) {
        const timeSlot = `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`;
        const slotDate = new Date();
        slotDate.setHours(slotHour, slotMinute, 0, 0);
    
        if (slotDate > new Date()) { // Only show future time slots
          gridHtml += `<button class='time-slot' onclick='selectTimeSlot("${timeSlot}", "${doctorName}")'>${timeSlot}</button>`;
        }
    
        slotMinute += granularityMinutes;
        if (slotMinute >= 60) {
          slotHour++;
          slotMinute %= 60;
        }
      }
    
      gridHtml += `</div>`;
      return gridHtml;
    }
    
  }
   const chatbox = new Chatbox();
  chatbox.display();
});

// Global functions to handle user interaction outside the Chatbox class
function selectTimeSlot(timeSlot, doctorName) {
  const chatMessages = document.querySelector('.chatbox__messages');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('messages__item', 'messages__item--visitor');
  messageDiv.innerHTML = `Chokran 7it khtariti ${timeSlot} m3a ${doctorName}. 3afak dakhal smitek o knitek o ra9m l hatif dyalek.`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

