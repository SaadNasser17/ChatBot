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
        selectList.innerHTML = `<option value="">Choisir une spécialité...</option>` + 
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
          let doctorInfo = `
            <div class='doctor-info'>
              <strong>Dr. ${doctor.lastname} ${doctor.firstname}</strong><br>
              Tel: ${doctor.tel}<br>
              Email: <a href='mailto:${doctor.email}'>${doctor.email}</a><br>
              Adresse: ${doctor.adresse}<br>
            </div>`;
          const agendaConfig = doctor.praticienCentreSoins[0].agendaConfig;
          doctorInfo += this.createAgendaGrid(agendaConfig);
          container.innerHTML += doctorInfo;
        });
      }
  
      createAgendaGrid(agendaConfig) {
        let gridHtml = `<div class='agenda-grid'>`;
        const openingHour = parseInt(agendaConfig.heureOuverture.split(':')[0], 10);
        const openingMinute = parseInt(agendaConfig.heureOuverture.split(':')[1], 10);
        const closingHour = parseInt(agendaConfig.heureFermeture.split(':')[0], 10);
        const closingMinute = parseInt(agendaConfig.heureFermeture.split(':')[1], 10);
        const granularityMinutes = parseInt(agendaConfig.granularite.split(':')[1], 10);
      
        // Get the current system time
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
      
        let slotHour = openingHour;
        let slotMinute = openingMinute;
      
        // Loop to generate time slots
        while (slotHour < closingHour || (slotHour === closingHour && slotMinute < closingMinute)) {
          // Create time slot as a string
          const timeSlot = `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`;
      
          // Convert time slot to a Date object
          const slotDate = new Date();
          slotDate.setHours(slotHour, slotMinute, 0, 0);
      
          // Check if the time slot is in the future
          if (slotDate > now) {
            // Create a button for the time slot
            gridHtml += `<button class='time-slot'>${timeSlot}</button>`;
          }
      
          // Increment the time slot by the granularity
          slotMinute += granularityMinutes;
          if (slotMinute >= 60) {
            slotHour++;
            slotMinute -= 60;
          }
        }
      
        gridHtml += `</div>`;
        return gridHtml;
      }
      displayAgendaGrid(doctorDetails, button) {
        // Get the centreSoin ID from the doctorDetails
        const centreSoinId = doctorDetails.praticienCentreSoins[0].centreSoin.id;
        this.fetchReservedSlots(centreSoinId).then((reservedSlots) => {
          const agendaConfig = doctorDetails.praticienCentreSoins[0].agendaConfig;
          const gridHtml = this.createFilteredAgendaGrid(agendaConfig, reservedSlots);
          const container = button.parentNode.querySelector('.appointments-container');
          container.innerHTML = gridHtml;
        });
      }
  
      fetchReservedSlots(centreSoinId) {
        // Fetch reserved slots using the centreSoin ID
        return fetch(`https://apipreprod.nabady.ma/api/holidays/praticienCs/${centreSoinId}/day/0/limit/5`)
          .then(response => response.json())
          .then(data => {
            // Map over the reserved and rdv slots and return an array of time ranges
            const reservedSlots = data.rdv.map(slot => ({
              start: new Date(slot['0'].start),
              end: new Date(slot['0'].end)
            }));
            return reservedSlots;
          })
          .catch(error => {
            console.error('Error fetching reserved slots:', error);
            return []; // Return an empty array in case of error
          });
      }
  
      createFilteredAgendaGrid(agendaConfig, reservedSlots) {
        let gridHtml = `<div class='agenda-grid'>`;
        const openingTime = agendaConfig.heureOuverture;
        const closingTime = agendaConfig.heureFermeture;
        const granularity = agendaConfig.granularite;
        
        // Convert times to minutes for easier comparison
        let [openingHour, openingMinutes] = openingTime.split(':').map(Number);
        let [closingHour, closingMinutes] = closingTime.split(':').map(Number);
        const granularityMinutes = parseInt(granularity.split(':')[1], 10);
  
        // Generate time slots and filter out reserved slots
        while (openingHour < closingHour || (openingHour === closingHour && openingMinutes < closingMinutes)) {
          let slotTime = new Date();
          slotTime.setHours(openingHour, openingMinutes, 0, 0);
          
          // Check if this slot is reserved
          let isReserved = reservedSlots.some(slot => slotTime >= slot.start && slotTime < slot.end);
          if (!isReserved) {
            let slotTimeString = `${String(openingHour).padStart(2, '0')}:${String(openingMinutes).padStart(2, '0')}`;
            gridHtml += `<button class='time-slot'>${slotTimeString}</button>`;
          }
  
          // Increment time slot
          openingMinutes += granularityMinutes;
          if (openingMinutes >= 60) {
            openingHour++;
            openingMinutes %= 60;
          }
        }
  
        gridHtml += `</div>`;
        return gridHtml;
      }
  
      createFilteredAgendaGrid(agendaConfig, reservedSlots) {
        let gridHtml = `<div class='agenda-grid'>`;
        const granularityMinutes = parseInt(agendaConfig.granularite.split(':')[1], 10);
        const now = new Date();
        let currentHour = now.getHours();
        let currentMinute = now.getMinutes() - (now.getMinutes() % granularityMinutes) + granularityMinutes;
  
        while (currentHour < 24) {
          const timeSlot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, currentMinute);
          if (!reservedSlots.some(slot => timeSlot >= slot.start && timeSlot < slot.end)) {
            const timeSlotString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
            gridHtml += `<button class='time-slot'>${timeSlotString}</button>`;
          }
          currentMinute += granularityMinutes;
          if (currentMinute >= 60) {
            currentHour++;
            currentMinute -= 60;
          }
        }
  
        gridHtml += `</div>`;
        return gridHtml;
      }
      
    }
  
    const chatbox = new Chatbox();
    chatbox.display();
  });
  