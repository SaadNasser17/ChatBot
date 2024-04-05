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
            this.args.chatMessages.addEventListener('click', (event) => {
                if (event.target.classList.contains('view-agenda')) {
                    // Extract doctor ID from data attribute (you'll need to set this up in your message rendering)
                    const doctorId = event.target.dataset.doctorId;
                    this.fetchDoctorAgenda(doctorId);
                }
            });
        
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
            if (this.state) {
                this.args.chatbox.classList.add('chatbox--active');
            } else {
                this.args.chatbox.classList.remove('chatbox--active');
            }
        }

        handleUserInput() {
            const userMessage = this.args.textfield.value.trim().toLowerCase();
            this.displayUserMessage(userMessage);
            this.args.textfield.value = '';
        
            // Check if any of the appointment-related patterns are included in the user message
            if (this.isAppointmentRelated(userMessage)) {
                // If true, fetch and display specialties
                this.fetchSpecialties();
            } else {
                // Otherwise, call Flask API for other responses
                this.callFlaskAPI(userMessage);
            }
        }
        isAppointmentRelated(message) {
            // Array of keywords or phrases related to making an appointment
            const appointmentKeywords = [
                "bghyt nakhod", "rendez vous", "bghyt ndowz", "bghyt nqabbel tabib", 
                "kanqalbek 3la rdv", "wach mumkin ndowz", "bghyt nqabbel doktor", 
                "bghyt n7jz", "kanqalbek 3la wqt","rdv"
            ];
        
            // Check if any of the keywords are in the user message
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
                    // If the tag is 'specialties', display the dropdown list
                    this.fetchSpecialties();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.displayBotMessage("Une erreur s'est produite, veuillez réessayer.");
            });
        }


        displayUserMessage(message) {
            this.displayMessage(message, 'user');
        }

        displayBotMessage(message) {
            this.displayMessage(message, 'bot');
        }

        displayMessage(message, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('messages__item');
            if (sender === 'user') {
                messageDiv.classList.add('messages__item--operator');
            } else {
                messageDiv.classList.add('messages__item--visitor');
            }
            // Change this line to use innerHTML
            messageDiv.innerHTML = message;
            this.args.chatMessages.appendChild(messageDiv);
            this.args.chatMessages.scrollTop = this.args.chatMessages.scrollHeight;
        }
        
        fetchSpecialties() {
            this.displayBotMessage("Hahouma les spécialités li moujoudin ...");
            fetch('/get_specialties')
                .then(response => response.json())
                .then(data => {
                    this.specialties = data['hydra:member'];
                    this.displaySpecialtiesDropdown();
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des spécialités:', error);
                });
        }

        displaySpecialtiesDropdown() {
            // Créez et affichez la liste déroulante pour les spécialités
            const selectList = document.createElement('select');
            selectList.id = 'specialtySelect';
            selectList.innerHTML = this.specialties.map(spec => `<option value="${spec.id}">${spec.name}</option>`).join('');
            selectList.addEventListener('change', (event) => {
                const specialtyId = event.target.value;
                this.displayDoctors(specialtyId); // Supposons que cette méthode ira chercher et afficher les médecins
            });

            // Placez la liste déroulante dans un conteneur pour faciliter sa gestion
            const selectContainer = document.createElement('div');
            selectContainer.classList.add('select-container');
            selectContainer.appendChild(selectList);
            this.args.chatMessages.appendChild(selectContainer);
            this.args.chatMessages.scrollTop = this.args.chatMessages.scrollHeight;
        }

        displaySpecialtiesDropdown() {
            // Créez et affichez la liste déroulante pour les spécialités
            const selectList = document.createElement('select');
            selectList.id = 'specialtySelect';
            selectList.innerHTML = `<option value="">Choisir une spécialité...</option>` +
                this.specialties.map(spec => `<option value="${spec.name}">${spec.name}</option>`).join('');
        
            selectList.addEventListener('change', (event) => {
                const specialtyName = event.target.value;
                this.displayDoctors(specialtyName); // Appel de la méthode pour afficher les médecins
            });
        
            const form = document.createElement('form');
            form.appendChild(selectList);
            this.args.chatMessages.appendChild(form);
            this.args.chatMessages.scrollTop = this.args.chatMessages.scrollHeight;
        }
        
        displayDoctors(specialtyId) {
            this.displayBotMessage("Recherche des médecins spécialisés en " + specialtyId + "...");
        
            fetch('/get_doctors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ specialty_name: specialtyId })
            })
            .then(response => response.json())
            .then(data => {
                if(!data.error){
                    this.displayDoctorList(data);
                } else {
                    this.displayBotMessage("Une erreur s'est produite lors de la recherche des médecins.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.displayBotMessage("Une erreur s'est produite lors de la recherche des médecins.");
            });
        }
        fetchDoctors(specialtyName) {
            // Make sure the API endpoint and the request payload are correct
            fetch('/get_doctors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ specialty_name: specialtyName })
            })
            .then(response => {
              if (!response.ok) {
                // This means the HTTP request itself failed. Log the status for debugging.
                console.error('HTTP Request Failed', response.status);
                throw new Error('HTTP Request Failed');
              }
              return response.json();
            })
            .then(data => {
                // If this log shows the expected data, the issue may be with how the data is being used.
                console.log(data);
                // Your logic to handle the doctors data here
            })
            .catch(error => {
                // Catch any errors and log them.
                console.error('Error fetching doctors:', error);
            });
          }
          
                  
        displayDoctorList(data) {
            let doctorsMessage = "<div class='doctor-list'>";
            if (data.praticien && Array.isArray(data.praticien.data)) {
                data.praticien.data.forEach(item => {
                    const doctor = item["0"];
                    if (doctor) {
                        // Format agendaConfig into a data attribute string
                        let agendaConfigData = '';
                        if (doctor.praticienCentreSoins) {
                            doctor.praticienCentreSoins.forEach(center => {
                                if (center.agendaConfig) {
                                    // Convert the agendaConfig object to a data attribute string
                                    agendaConfigData = Object.entries(center.agendaConfig).map(([key, val]) => `data-${key}="${val}"`).join(' ');
                                }
                            });
                        }
        
                        doctorsMessage += `
                            <div class='doctor-info'>
                                <strong>Dr. ${doctor.lastname} ${doctor.firstname}</strong><br>
                                Tel: ${doctor.tel}<br>
                                Email: <a href='mailto:${doctor.email}'>${doctor.email}</a><br>
                                Adresse: ${doctor.adresse}<br>
                                <button class='view-agenda' ${agendaConfigData}>Voir l'agenda</button>
                            </div>`;
                    }
                });
            } else {
                doctorsMessage += "<div>Aucun médecin trouvé.</div>";
            }
            doctorsMessage += "</div>";
        
            this.displayBotMessage(doctorsMessage);
            this.addAgendaButtonListeners();
        }

        addAgendaButtonListeners() {
            const buttons = document.querySelectorAll('.view-agenda');
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const doctorInfoDiv = e.target.closest('.doctor-info');
                    const agendaConfig = Array.from(e.target.attributes)
                                              .filter(attr => attr.name.startsWith('data-'))
                                              .reduce((config, attr) => {
                                                  const attrName = attr.name.replace('data-', '');
                                                  config[attrName] = attr.value;
                                                  return config;
                                              }, {});
                    this.appendAgendaDetails(doctorInfoDiv, agendaConfig);
                });
            });
        }
        
        appendAgendaDetails(doctorInfoDiv, agendaConfig) {
            // Create a container for the agenda details if not already present
            let agendaDetailsContainer = doctorInfoDiv.querySelector('.agenda-details');
            if (!agendaDetailsContainer) {
                agendaDetailsContainer = document.createElement('div');
                agendaDetailsContainer.classList.add('agenda-details');
                doctorInfoDiv.appendChild(agendaDetailsContainer);
            }
        
            // Populate the agenda details container with the agendaConfig info
            agendaDetailsContainer.innerHTML = `
                <div>Heure d'ouverture: ${agendaConfig.heureouverture}</div>
                <div>Heure de fermeture: ${agendaConfig.heurefermeture}</div>
                <div>Granularité: ${agendaConfig.granularite}</div>
                <!-- Include additional agendaConfig details as needed -->
            `;
            // Optionally, hide the "Voir l'agenda" button after displaying the details
            const agendaButton = doctorInfoDiv.querySelector('.view-agenda');
            if (agendaButton) {
                agendaButton.style.display = 'none';
            }
        }

        fetchDoctorAgenda(doctorId) {
            // Make an API call to fetch the agendaConfig using the doctorId
            // For example, if your API endpoint is "/get_doctor_agenda":
            fetch(`/get_doctor_agenda`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId: doctorId })
            })
            .then(response => response.json())
            .then(agendaConfig => {
                // Now format the agendaConfig and display it in the chat
                this.displayAgendaConfig(agendaConfig);
            })
            .catch(error => {
                console.error('Error fetching doctor agenda:', error);
            });
        }
        
        displayAgendaConfig(agendaConfig) {
            // Format and display the agendaConfig details
            let agendaDetails = `<div class='agenda-details'>`;
            for (const [key, value] of Object.entries(agendaConfig)) {
                agendaDetails += `<div>${key}: ${value}</div>`;
            }
            agendaDetails += `</div>`;
            
            this.displayBotMessage(agendaDetails);
        }




        

    }

    const chatbox = new Chatbox();
    chatbox.display();
  
});
