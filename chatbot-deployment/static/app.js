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
        // Initialisation du chat avec l'ouverture du bouton et l'envoi du bouton
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
        // Ouvrir et fermer le chat
        this.state = !this.state;
        if (this.state) {
            this.args.chatbox.classList.add('chatbox--active');
        } else {
            this.args.chatbox.classList.remove('chatbox--active');
        }
    }

    handleUserInput() {
        const userMessage = this.args.textfield.value.trim().toLowerCase();
        console.log("Message utilisateur:", userMessage); // Ajout du log pour déboguer
    
        if (userMessage) {
            this.displayUserMessage(userMessage); // Afficher le message de l'utilisateur
            this.args.textfield.value = ''; // Effacer le champ de texte après l'envoi du message
        }
    
        // Vérifier si la réponse de l'utilisateur correspond à un motif dans le fichier JSON
        const matchedPattern = this.findMatchingPattern(userMessage);
        if (matchedPattern) {
            this.displayBotMessage(matchedPattern.response);
            // Si le motif correspond, exécutez les actions appropriées, comme récupérer les spécialités
            if (matchedPattern.tag === "rendez-vous") {
                this.fetchSpecialties(); // Appel de la méthode pour récupérer les spécialités
            }
            return;
        }
    
        // Si aucune correspondance n'est trouvée, affichez un message par défaut ou prenez une autre action
        this.displayBotMessage("Je suis désolé, je ne comprends pas.");
    }
    

    displayUserMessage(message) {
        this.displayMessage(message, 'user');
    }
    

    displayBotMessage(message) {
        this.displayMessage(message, 'bot');
    }

    displayMessage(message, sender) {
        // Afficher un message dans le chat
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('messages__item');
        if (sender === 'user') {
            messageDiv.classList.add('messages__item--operator');
        } else {
            messageDiv.classList.add('messages__item--visitor');
        }
        messageDiv.textContent = message;
        this.args.chatMessages.appendChild(messageDiv);
        this.args.chatMessages.scrollTop = this.args.chatMessages.scrollHeight;
    }

    fetchSpecialties() {
        // Simuler la récupération des spécialités
        this.displayBotMessage("Je recherche les spécialités disponibles...");
        fetch('https://apiuat.nabady.ma/api/specialites')
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
        // Créer et afficher la liste déroulante des spécialités
        const select = document.createElement('select');
        select.innerHTML = this.specialties.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        select.onchange = (e) => this.handleSpecialtySelection(e.target.value);
        this.args.chatMessages.appendChild(select);
        this.args.chatMessages.scrollTop = this.args.chatMessages.scrollHeight;
    }

    handleSpecialtySelection(specialtyId) {
        // Traiter la sélection de la spécialité
        const specialty = this.specialties.find(s => s.id === specialtyId);
        this.displayBotMessage(`Vous avez choisi la spécialité : ${specialty.name}.`);
        // Continuer le processus, comme rechercher les médecins disponibles
    }

    findMatchingPattern(userMessage) {
        // Simuler la recherche de motifs correspondants
        const patterns = [
            { tag: "rendez-vous", response: "Veuillez choisir une spécialité pour prendre rendez-vous." },
            { tag: "greeting", response: "Bonjour ! Comment puis-je vous aider aujourd'hui ?" }
            // Ajoutez d'autres motifs et leurs réponses ici
        ];

        // Recherche du motif correspondant dans la liste des motifs
        for (const pattern of patterns) {
            if (userMessage.includes(pattern.tag)) {
                return pattern;
            }
        }

        // Aucun motif correspondant trouvé
        return null;
    }

    // Autres méthodes si nécessaires...
}

const chatbox = new Chatbox();
