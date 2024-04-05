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
                    if (doctor && doctor.praticienCentreSoins) {
                        // Récupérer l'agendaConfig pour ce médecin
                        const agendaConfig = doctor.praticienCentreSoins[0].agendaConfig;
                        doctorsMessage += `
                            <div class='doctor-info' data-doctor-id='${doctor.praticienCentreSoins[0].id}'>
                                <strong>Dr. ${doctor.lastname} ${doctor.firstname}</strong><br>
                                Tel: ${doctor.tel}<br>
                                Email: <a href='mailto:${doctor.email}'>${doctor.email}</a><br>
                                Adresse: ${doctor.adresse}<br>
                                <div class='agenda-details'>
                                    <strong>Agenda:</strong><br>
                                    Heure d'ouverture: ${agendaConfig.heureOuverture}<br>
                                    Heure de fermeture: ${agendaConfig.heureFermeture}<br>
                                    Granularité: ${agendaConfig.granularite}<br>
                                </div>
                             
                                <button class='book-appointment' data-doctor-id='${doctor.praticienCentreSoins[0].id}'>Rendez-vous</button>
                                <!-- Un nouvel emplacement pour les détails des rendez-vous ici -->
                                <div class='appointments-container'></div>
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

    document.querySelectorAll('.book-appointment').forEach(button => {
        button.addEventListener('click', (e) => {
            // Log pour débogage
            console.log('Bouton "Rendez-vous occupés" cliqué avec ID:', e.target.dataset.doctorId);
            this.fetchAppointments(e.target.dataset.doctorId);
        });
    });
}

        
        fetchAppointments(doctorId) {
            fetch(`https://apiuat.nabady.ma/api/holidays/praticienCs/${doctorId}/day/0/limit/3`)
                .then(response => response.json())
                .then(appointmentsData => {
                    this.displayAppointments(doctorId, appointmentsData);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des rendez-vous:', error);
                });
        }

        displayAppointments(doctorId, appointmentsData) {
            let appointmentsHtml = '<div class="appointments-container">';
            appointmentsData.rdv.forEach(appointment => {
                const startTime = new Date(appointment['0'].start);
                const endTime = new Date(appointment['0'].end);
                appointmentsHtml += `
                    <div class="appointment-item">
                        <div>Debut: ${startTime.toLocaleString()}</div>
                        <div>Fin: ${endTime.toLocaleString()}</div>
                    </div>`;
            });
            appointmentsHtml += '</div>';
          
            // Trouver le conteneur du médecin spécifique grâce à l'ID et y ajouter les détails des rendez-vous
            const doctorInfoDiv = document.querySelector(`.doctor-info[data-doctor-id="${doctorId}"]`);
            if (doctorInfoDiv) {
                const appointmentsContainer = doctorInfoDiv.querySelector('.appointments-container');
                if (appointmentsContainer) {
                    appointmentsContainer.innerHTML = appointmentsHtml;
                } else {
                    const newAppointmentsContainer = document.createElement('div');
                    newAppointmentsContainer.classList.add('appointments-container');
                    newAppointmentsContainer.innerHTML = appointmentsHtml;
                    doctorInfoDiv.appendChild(newAppointmentsContainer);
                }
            }
        }

       





        

    }

    const chatbox = new Chatbox();
    chatbox.display();
  
});
