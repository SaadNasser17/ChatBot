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
        "bghyt nakhod maw3id","bghyt nakhod maou3id", "bghyt ndowz", "bghyt nqabbel tabib", 
          "kanqalbek 3la rdv", "wach mumkin ndowz", "bghyt nqabbel doktor", 
          "bghyt n7jz", "kanqalbek 3la wqt","bghit ndir rendez-vous","bghit ndir rdv","bghit nakhod rendez vous","bghit nakhod rendez-vous","bghit nakhod rdv","bghit nakhod maw3id","bghyt nakhod maou3id","bghyt na7jez maw3id","bghyt ne7jez maou3id",
          "momkin nji l clinic?","rdv",
          "bghit n3ayet l doctor","bghit n3ayet l docteur","bghit n3ayet l tbib",
          "kayn chi rdv disponible?",
          "bghit nchouf docteur", "bghit nchouf tbib",
          "fin momkin nl9a rdv?","fin momkin nakhod rdv?",
          "wach momkin nl9a rendez-vous lyoma?",
          "bghit nreserve wa9t m3a tbib",
          "mnin ymkni ndir rendez-vous?",
          "kifach nqder ndir rendez-vous?",
          " momkin te3tini liste dyal tbibes disponibles.","Kifach nakhod rendez-vous avec le médecin?","consultation",    "بغيت ناخد موعد",  "بغيت ندوز", "بغيت نقابل طبيب",   " كنقلبك على rendez vous","كنقلبك على موعد", "بغيت نقابل طبيب", "واش ممكن ندوز", "بغيت نقابل دكتور", "بغيت نحجز", "بغيت نحجز موعد",
           "كنقلبك على وقت","بغيت ندير rendez-vous","بغيت ندير rdv","بغيت ناخد rendez vous", "بغيت ناخد rendez-vous", "بغيت ناخد rdv",   "بغيت ناخد موعد",  "بغيت نحجز موعد","بغيت نشوف دكتور", "بغيت نشوف طبيب", "فين ممكن نلقى rendez vous?","فين ممكن نلقى rendez vous?",
           "فين ممكن نلقى موعد؟","فين ممكن نلقى rendez vous؟","واش ممكن نلقى موعد ليوما؟", "بغيت نريزرفي وقت مع طبيب","ممكن تعطيني ليست ديال طبيب متاحين؟","موعد"

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
      specialites = {
      "anesthésie": "تخدير",
      "diabétologie nutritionnelle": "التغذية وعلاج السكري",
      "endocrinologie": "علم الغدد الصماء",
      "pédiatrie": "طب الأطفال",
      "allergologie": "طب الحساسية",
      "nutrition": "تغذية",
      "médecine générale": "الطب العام",
      "médecine du sport": "طب الرياضة",
      "urologie": "جراحة المسالك البولية",
      "chirurgie cardio": "جراحة القلب",
      "chirurgie vasculaire": "جراحة الأوعية الدموية",
      "chirurgie générale": "الجراحة العامة",
      "chirurgie orthopédiste": "جراحة العظام",
      "traumatologie": "طب الإصابات",
      "orthopédie": "جراحة العظام",
      "médecine du travail": "طب العمل",
      "gynécologie obstétrique": "أمراض النساء والتوليد",
      "dermatologie": "طب الجلدية",
      "ophtalmologie": "طب العيون",
      "pneumologie": "طب الرئة",
      "cardiologie": "طب القلب",
      "chirurgie cancérologique": "جراحة الأورام",
      "néphrologie": "طب الكلى",
      "médecine interne": "الطب الباطني",
      "neuropsychiatrie": "الطب النفسي العصبي",
      "psychiatrie": "طب النفس",
      "oto-rhino-laryngologie": "طب الأنف والأذن والحنجرة",
      "chirurgie plastique": "جراحة التجميل",
      "gastroentérologie": "طب الجهاز الهضمي",
      "médecine physique et de réadaptation": "الطب الفيزيائي وإعادة التأهيل"
    };
    
    fetchSpecialties() {
      fetch('/get_specialties')
        .then(response => response.json())
        .then(data => {
          this.specialties = data['hydra:member'].map(specialty => ({
            ...specialty,
            name: specialites[specialty.name] || specialty.name // Traduire ou utiliser le nom original
          }));
          this.displaySpecialtiesDropdown();
        })
        .catch(error => {
          console.error('Error fetching specialties:', error);
        });
    }
    
    displaySpecialtiesDropdown() {
      let selectContainer = document.querySelector('.select-container');
      if (!selectContainer) {
        selectContainer = document.createElement('div');
        selectContainer.classList.add('select-container');
        this.args.chatMessages.appendChild(selectContainer);
      }
    
      let lastDisplayedIndex = 2; // Start with the first three specialties displayed
      const displaySpecialties = (startIndex, endIndex) => {
        // Clear existing specialty buttons before displaying new ones
        selectContainer.innerHTML = '';
        for (let i = startIndex; i <= endIndex && i < this.specialties.length; i++) {
          const button = document.createElement('button');
          button.textContent = this.specialties[i].name;
          button.addEventListener('click', () => {
            this.fetchDoctorsForSpecialty(this.specialties[i].name);
          });
          selectContainer.appendChild(button);
        }
    
        // Append or re-enable "Show More" button if there are more specialties to show
        if (endIndex < this.specialties.length - 1) {
          const showMoreButton = document.createElement('button');
          showMoreButton.textContent = 'Show More Specialties';
          showMoreButton.addEventListener('click', () => {
            displaySpecialties(endIndex + 1, endIndex + 3);
          });
          selectContainer.appendChild(showMoreButton);
        }
      };
    
      // Initial display of specialties and the "Show More" button
      displaySpecialties(0, lastDisplayedIndex);
    }
    

    fetchDoctorsForSpecialty(specialtyName) {
      fetch('https://apipreprod.nabady.ma/api/users/medecin/search', {
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
      container.innerHTML = '';  // Clear existing doctor details
  
      doctorData.forEach(item => {
          const doctor = item["0"];
          const doctorName = `Dr. ${doctor.lastname} ${doctor.firstname}`;
          const agendaConfig = doctor.praticienCentreSoins[0].agendaConfig;
  
          // Generate available time slots for the doctor
          const availableSlots = this.createAgendaGrid(agendaConfig, doctorName, true);
  
          // Only display doctors with available future time slots
          if (availableSlots.length > 0) {
              let doctorInfo = `
                  <div class='doctor-info'>
                    <strong>${doctorName}</strong><br>
                    Tel: ${doctor.tel}<br>
                    Email: <a href='mailto:${doctor.email}'>${doctor.email}</a><br>
                    Address: ${doctor.adresse}<br>
                  </div>`;
              doctorInfo += this.createAgendaGrid(agendaConfig, doctorName); // Display the time slots
              container.innerHTML += doctorInfo;
          }
      });
  }
  
  hasAvailableSlots(agendaConfig) {
      const closingHour = parseInt(agendaConfig.heureFermeture.split(':')[0], 10);
      const closingMinute = parseInt(agendaConfig.heureFermeture.split(':')[1], 10);
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
  
      // Check if the current time is before the doctor's closing time
      return (currentHour < closingHour || (currentHour === closingHour && currentMinute < closingMinute));
  }
  
    
   createAgendaGrid(agendaConfig, doctorName, checkOnly = false) {
    const openingHour = parseInt(agendaConfig.heureOuverture.split(':')[0], 10);
    const openingMinute = parseInt(agendaConfig.heureOuverture.split(':')[1], 10);
    const closingHour = parseInt(agendaConfig.heureFermeture.split(':')[0], 10);
    const closingMinute = parseInt(agendaConfig.heureFermeture.split(':')[1], 10);
    const granularityMinutes = parseInt(agendaConfig.granularite.split(':')[1], 10);

    let slotHour = openingHour;
    let slotMinute = openingMinute;
    let futureSlots = [];

    while (slotHour < closingHour || (slotHour === closingHour && slotMinute < closingMinute)) {
        const timeSlot = `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`;
        const slotDate = new Date();
        slotDate.setHours(slotHour, slotMinute, 0, 0);

        if (slotDate > new Date()) { // Only show future time slots
            futureSlots.push(timeSlot);
        }

        slotMinute += granularityMinutes;
        if (slotMinute >= 60) {
            slotHour++;
            slotMinute %= 60;
        }
    }

    if (checkOnly) {
        return futureSlots; // Return slots for checking availability
    }

    let gridHtml = `<div class='agenda-grid'>`;
    futureSlots.slice(0, 5).forEach(timeSlot => {
        gridHtml += `<button class='time-slot' onclick='selectTimeSlot("${timeSlot}", "${doctorName}")'>${timeSlot}</button>`;
    });
    gridHtml += `</div>`;
    return gridHtml;
}

    // After the user selects a time slot, clear the chat and display the confirmation form
clearChatAndDisplayForm(timeSlot, doctorName) {
  const chatMessages = document.querySelector('.chatbox__messages');
  chatMessages.innerHTML = ''; // Clear the chat messages
  
  const confirmationMessage = document.createElement('div');
  confirmationMessage.classList.add('messages__item', 'messages__item--visitor');
  confirmationMessage.innerHTML = `Chokran 7it khtariti ${timeSlot} m3a ${doctorName}. 3afak dakhal smitek.`;
  chatMessages.appendChild(confirmationMessage);
  
  const form = document.createElement('form');
  form.innerHTML = `
      <label for="firstName">First Name:</label>
      <input type="text" id="firstName" name="firstName" required><br><br>
      <label for="lastName">Last Name:</label>
      <input type="text" id="lastName" name="lastName" required><br><br>
      <label for="phoneNumber">Phone Number:</label>
      <input type="tel" id="phoneNumber" name="phoneNumber" required><br><br>
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required><br><br>
      <button type="submit">Confirm Appointment</button>
  `;
  
  form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const userData = {
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          phoneNumber: formData.get('phoneNumber'),
          email: formData.get('email'),
          doctorName: doctorName,
          timeSlot: timeSlot
      };
      this.saveUserData(userData);
  });
  
  chatMessages.appendChild(form);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

  }

  const chatbox = new Chatbox();
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