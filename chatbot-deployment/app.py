from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import random
import os
from datetime import datetime
import requests
from pymongo import MongoClient
import bcrypt
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
app = Flask(__name__)
CORS(app)

# MongoDB connection setup
client = MongoClient(
    os.getenv("MONGO_URI"),
    tls=True,
    tlsAllowInvalidCertificates=True
)

# Access collections in different databases
db_datasets = client["Datasets"]
intents_collection = db_datasets["Intents"]
unrecognized_intents_collection = db_datasets["Unrecognized intents"]
users_collection = client["Users"]["Users"]

# Access collections in the AppointmentRelated database
db_appointment_related = client["AppointmentRelated"]

db_appointments = client["appointments"]  # The database is "appointments"
appointments_collection = db_appointments["appointments"]  # The collection is "appointments"


fallback_messages = {
    "darija": "mafhamtch t9dr t3awd",
    "الدارجة": "مافهمتش تقدر تعاود",
    "العربية": "لم أفهم، هل يمكنك إعادة المحاولة؟",
    "francais": "Je ne comprends pas.",
    "english": "I don't understand."
}

# Define global headers for all API calls
GLOBAL_HEADERS = {
    "Origin": "chatbotNabady"
}

# Function for making GET requests with global headers and error handling
def api_get_request(url):
    try:
        response = requests.get(url, headers=GLOBAL_HEADERS)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from {url}: {e}")
        return None


# Function for making POST requests with global headers and error handling
def api_post_request(url, data):
    try:
        response = requests.post(url, json=data, headers=GLOBAL_HEADERS)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print(f"Error sending data to {url}: {e}")
        return None

    
@app.route('/get_word_lists', methods=['GET'])
def get_word_lists():
    try:
        db = client['AppointmentRelated']

        # Fetch actionWords
        action_words_doc = db['actionWords'].find_one()
        actionWords = action_words_doc.get('words', []) if action_words_doc else []

        # Fetch appointmentKeywords
        appointment_keywords_doc = db['appointmentKeywords'].find_one()
        appointmentKeywords = appointment_keywords_doc.get('words', []) if appointment_keywords_doc else []

        # Fetch medicalWords
        medical_words_doc = db['medicalWords'].find_one()
        medicalWords = medical_words_doc.get('words', []) if medical_words_doc else []

        return jsonify({
            'actionWords': actionWords,
            'appointmentKeywords': appointmentKeywords,
            'medicalWords': medicalWords
        }), 200  # Explicitly returning 200 status code for success

    except Exception as e:
        print(f"Error fetching word lists: {e}")  # Improved error logging
        return jsonify({'error': f'Failed to fetch word lists due to: {str(e)}'}), 500

@app.route('/add_word', methods=['POST'])
def add_word():
    try:
        db = client['AppointmentRelated']
        data = request.get_json()
        word_type = data.get('type')  # 'actionWords', 'appointmentKeywords', or 'medicalWords'
        new_word = data.get('word')

        if not new_word:
            return jsonify({'error': 'No word provided'}), 400

        # Determine the correct collection based on type
        if word_type == 'actionWords':
            collection = db['actionWords']
        elif word_type == 'appointmentKeywords':
            collection = db['appointmentKeywords']
        elif word_type == 'medicalWords':
            collection = db['medicalWords']
        else:
            return jsonify({'error': 'Invalid word type'}), 400

        # Update the existing document to add the new word to the "words" array
        result = collection.update_one(
            {},  # Empty filter to match the first document
            {'$push': {'words': new_word}}
        )

        if result.modified_count == 0:
            return jsonify({'error': 'Failed to add word to the list'}), 400

        return jsonify({'message': 'Word added successfully'}), 201

    except Exception as e:
        print(f"Error adding word: {e}")
        return jsonify({'error': f'Failed to add word due to: {str(e)}'}), 500


#start of login for admin panel
# Function to authenticate the user
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Find the user in the MongoDB collection
    user = users_collection.find_one({"username": username})

    if user:
        # Check if the password matches the hashed password stored in the database
        if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({"message": "Login successful!", "auth": True}), 200
        else:
            return jsonify({"message": "Invalid credentials", "auth": False}), 401
    else:
        return jsonify({"message": "User not found", "auth": False}), 404

# Hashing password before saving to the database
def create_user(username, password):
    # Check if the user already exists
    existing_user = users_collection.find_one({"username": username})
    if existing_user:
        print(f"User {username} already exists in the database.")
        return
    
    # If user doesn't exist, hash the password and create the user
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

    # Store the new user in MongoDB
    users_collection.insert_one({
        "username": username,
        "password": hashed_password.decode('utf-8')  # Save as string in MongoDB
    })
    print(f"User {username} created successfully.")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        message = data.get("message", "")
        selected_language = data.get("language", "")
        
        if not message or not selected_language:
            return jsonify({"error": "Missing required fields: 'message' or 'language'"}), 400
        
        intent_tag = get_intent(message, selected_language)
        response, tag = get_response_and_tag(intent_tag, selected_language)
        
        return jsonify({"answer": response, "tag": tag}), 200
    
    except Exception as e:
        print(f"Error in /predict route: {e}")  # Improved error logging
        return jsonify({"error": f"Failed to process the prediction due to: {str(e)}"}), 500

def get_intent(message, language):
    message = message.lower()

    intents_data = intents_collection.find_one({"language": language})
    if not intents_data:
        store_unrecognized_word(message, language)
        return "default"
    
    for intent in intents_data["intents"]:
        for pattern in intent["patterns"]:
            if pattern.lower() in message:
                return intent["tag"]

    store_unrecognized_word(message, language)
    return "default"

def get_response_and_tag(intent_tag, language):
    if intent_tag == "default":
        return fallback_messages.get(language, fallback_messages["darija"]), "default"

    intents_data = intents_collection.find_one({"language": language})
    if not intents_data:
        return fallback_messages["english"], "default"

    for intent in intents_data["intents"]:
        if intent["tag"] == intent_tag:
            return random.choice(intent["responses"]), intent_tag

    return fallback_messages[language], "default"

def store_unrecognized_word(message, language):
    # Standardizing the language key format to avoid creating new unexpected documents
    language_key = f"unrecognized-{language.lower()}"
    unrecognized_intents_collection.update_one(
        {"language": language_key},
        {"$push": {"unrecognized_words": message}},
        upsert=True
    )

@app.route('/unrecognized_intents', methods=['GET'])
def get_unrecognized_intents():
    try:
        cursor = unrecognized_intents_collection.find({})
        unrecognized_intents = {doc["language"].split('-')[-1]: doc.get("unrecognized_words", []) for doc in cursor}
        return jsonify({'unrecognized_intents': unrecognized_intents}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/add_intent/<language>', methods=['POST'])
def add_intent(language):
    data = request.get_json()
    new_intent = {
        "tag": data['tag'],
        "patterns": data['patterns'],
        "responses": data['responses']
    }
    language_key = language.lower()
    try:
        intents_collection.update_one(
            {"language": language_key},
            {"$push": {"intents": new_intent}},
            upsert=False  # Changed to False to prevent creating new documents
        )
        unrecognized_language_key = f"unrecognized-{language_key}"
        unrecognized_intents_collection.update_one(
            {"language": unrecognized_language_key},
            {"$pull": {"unrecognized_words": {"$in": data['patterns']}}}
        )
        return jsonify({"message": "Intent added and removed from unrecognized intents successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/load_intents/<language>', methods=['GET'])
def load_intents(language):
    try:
        intents_data = intents_collection.find_one({"language": language}, {"_id": 0, "intents": 1})
        if intents_data:
            return jsonify({"intents": intents_data["intents"]}), 200
        else:
            return jsonify({"error": "No intents found for the specified language"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/update_intent/<language>', methods=['POST'])
def update_intent(language):
    data = request.get_json()
    language_key = language.lower()
    try:
        intents_collection.update_one(
            {"language": language_key, "intents.tag": data['tag']},
            {"$set": {"intents.$.patterns": data['patterns'], "intents.$.responses": data['responses']}},
            upsert=False
        )
        unrecognized_language_key = f"unrecognized-{language_key}"
        unrecognized_intents_collection.update_one(
            {"language": unrecognized_language_key},
            {"$pull": {"unrecognized_words": {"$in": data['patterns']}}}
        )
        return jsonify({"message": "Intent updated and removed from unrecognized intents successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ignore_unrecognized_intent/<language>', methods=['POST'])
def ignore_unrecognized_intent(language):
    try:
        data = request.get_json()
        pattern_to_ignore = data['pattern']
        language_key = f"unrecognized-{language.lower()}"

        # Pull the pattern from the unrecognized words list
        unrecognized_intents_collection.update_one(
            {"language": language_key},
            {"$pull": {"unrecognized_words": pattern_to_ignore}}
        )

        return jsonify({"message": f"Pattern '{pattern_to_ignore}' removed successfully from unrecognized intents"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin', methods=['GET'])
def serve_admin():
    return send_from_directory('', 'admin.html')

@app.route("/get_specialties")
def get_specialties():
    response = api_get_request("https://apipreprod.nabady.ma/api/specialites")
    if response:
        if response.status_code == 200:
            return jsonify(response.json()), 200
        elif response.status_code == 404:
            return jsonify({"error": "Specialties not found"}), 404
        elif response.status_code == 500:
            return jsonify({"error": "Server error occurred while fetching specialties"}), 500
    else:
        return jsonify({"error": "Failed to connect to specialties API"}), 502


def fetch_doctors_from_api(query, consultation='undefined', page=1, result=15, isIframe=False, referrer=""):
    data = {
        "query": query,
        "consultation": consultation,
        "page": page,
        "result": result,
        "isIframe": isIframe,
        "referrer": referrer,
        "domain": "ma"
    }

    response = api_post_request("https://apipreprod.nabady.ma/api/users/medecin/search", data)

    if response:
        if response.status_code == 200:
            doctors = response.json().get('praticien', {}).get('data', [])
            for doctor in doctors:
                praticien_info = doctor.get("0", {}).get("praticien", {})
                if not praticien_info:
                    print(f"Error: Missing praticien info in doctor data - {doctor}")
                    continue

                praticien_centre_soins = praticien_info.get("praticienCentreSoins", [])
                if praticien_centre_soins and isinstance(praticien_centre_soins[0], str):
                    pcs_id = praticien_centre_soins[0].split("/")[-1]
                else:
                    pcs_id = None

                if pcs_id:
                    appointments_response = api_get_request(f"https://apipreprod.nabady.ma/api/holidays/praticienCs/{pcs_id}/day/0/limit/2")
                    if appointments_response and appointments_response.status_code == 200:
                        unavailable_times = appointments_response.json()
                        doctor['available_slots'] = filter_available_slots(doctor.get("0", {}).get('agendaConfig', {}), unavailable_times)
                    else:
                        doctor['available_slots'] = []
                else:
                    doctor['available_slots'] = []
            return doctors
        else:
            print(f"Error fetching doctors: Status code {response.status_code}, {response.text}")
    else:
        print("Error: No response from the server.")
    return None



@app.route("/get_doctors", methods=["POST"])
def get_doctors():
    data = request.get_json()
    specialty_name = data.get("specialty_name")
    doctors_data = fetch_doctors_from_api(query=specialty_name)
    if doctors_data:
        return jsonify(doctors_data), 200
    else:
        return jsonify({"error": "Failed to fetch doctors"}), 500



def filter_available_slots(agendaConfig, unavailable_times):
    available_slots = []
    
    # Safely parse heureOuverture and heureFermeture
    opening_hour = int(agendaConfig['heureOuverture'].split(":")[0])
    closing_hour = int(agendaConfig['heureFermeture'].split(":")[0])

    # Safely parse the granularity and handle cases where it's not exactly two parts
    granularite_split = agendaConfig['granularite'].split(":")
    
    if len(granularite_split) == 2:
        granularity_hours, granularity_minutes = map(int, granularite_split)
    else:
        print(f"Error: Invalid granularity format - {agendaConfig['granularite']}")
        granularity_hours, granularity_minutes = 0, 30  # Default to 30 minutes if invalid
    
    slot_time = opening_hour * 60
    end_time = closing_hour * 60

    unavailable_starts = [entry["currentStart"].split(" ")[1][:5] for entry in unavailable_times['rdv']]

    while slot_time < end_time:
        hour = slot_time // 60
        minute = slot_time % 60
        slot_str = f"{hour:02}:{minute:02}"
        if slot_str not in unavailable_starts:
            available_slots.append(slot_str)
        slot_time += granularity_hours * 60 + granularity_minutes

    return available_slots


@app.route('/get_doctors_agenda', methods=['GET'])
def get_doctors_agenda():
    response = fetch_doctors_from_api(query="")
    if response.status_code == 200:
        doctors = response.json()['praticien']['data']
        results = []
        for doctor in doctors:
            agenda_config = doctor['praticienCentreSoins'][0]['agendaConfig']
            results.append({
                'name': f"{doctor['0']['firstname']} {doctor['0']['lastname']}",
                'praticien_centre_soin_id': doctor['praticienCentreSoins'][0]['id'],
                'agenda_config': agenda_config
            })
        return jsonify(results)
    else:
        return jsonify({'error': 'Failed to fetch doctors'}), response.status_code


def send_appointment_to_api(appointment_details, email):
    appointment_data = {
        "praticienCs": appointment_details["praticien"]["PraticienCentreSoinID"],
        "patient": appointment_details["patient"]["patientId"],
        "date_time_start": appointment_details["praticien"]["timeSlot"],
        "motif": appointment_details["motifId"],
        "type_rdv": "Cabinet",
        "id": None,
        "typeNotif": "sms",
        "emailParent": email
    }

    headers = {
        "Origin": "https://preprod.nabady.ma",
        "Content-Type": "application/json"
    }

    response = requests.post('https://apipreprod.nabady.ma/api/agenda_evenements/prise-rdv', json=appointment_data, headers=headers)

    if response and response.status_code in [200, 201]:
        response_data = response.json()
        ref = response_data.get('id')
        print("Appointment created successfully. Response:", response_data)
        return ref
    else:
        if response:
            print(f"Failed to create appointment. Status code: {response.status_code}, Response: {response.text}")
            return None
        else:
            print("Error: No response from the server.")
            return None

@app.route('/register_user', methods=['POST'])
def register_user():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone_number = data.get('phone_number')
    email = data.get('email')

    user_data = {
        "user": {
            "typeUser": {
                "@id": "/api/type_users/24",
                "@type": "TypeUser",
                "libelle": "Patient",
                "variableName": "patient",
                "id": 24
            },
            "firstname": first_name,
            "lastname": last_name,
            "tel": phone_number,
            "email": email,
            "password": "Elajdoc@2022",
            "consentement": True
        },
        "validateBYCode": False
    }

    response = api_post_request('https://apipreprod.nabady.ma/api/users/register', user_data)

    if response and response.status_code == 201:
        data = response.json()
        patient_id = data["user"]["id"]
        gpatient_id = data["user"]["gpatient"]["id"]
        print(f"Patient ID: {patient_id}, GPatient ID: {gpatient_id}")
        return jsonify({'message': 'User registered successfully!', 'patient_id': patient_id, 'gpatient_id': gpatient_id}), 201
    elif response:
        print(f"Error registering user: Status code {response.status_code}, {response.text}")
        return jsonify({'error': 'Failed to register user'}), response.status_code
    else:
        print("Error: No response from the server.")
        return jsonify({'error': 'No response from register API'}), 502

@app.route('/submit_details', methods=['POST'])
def submit_details():
    data = request.json
    userName = data['userName']
    userPhone = data['userPhone']
    doctorName = data['doctorName']
    timeSlot = data['timeSlot']
    
    recap_message = f"hahoma lma3lomat dyalk\n{userName}\n{userPhone}\n{doctorName}\n{timeSlot}"
    return jsonify({'recapMessage': recap_message})

@app.route("/process_response", methods=["POST"])
def process_response():
    data = request.get_json()
    response = data.get('response')
    step = data.get('step')

    if 'appointment_details' not in session:
        requests.session['appointment_details'] = {}

    if step == 1:
        requests.session['appointment_details']['first_name'] = response
    elif step == 2:
        requests.session['appointment_details']['last_name'] = response
    elif step == 3:
        requests.session['appointment_details']['phone_number'] = response

        return jsonify({"message": "Response processed", "next_step": step + 1, "complete": True})
    
    requests.session.modified = True
    return jsonify({"message": "Response processed", "next_step": step + 1})

@app.route('/save_appointment', methods=['POST'])
def save_appointment():
    data = request.get_json()
    directory = '/var/www/backend'
    filename = 'appointments.json'
    filepath = os.path.join(directory, filename)

    # Créer le répertoire s'il n'existe pas
    if not os.path.exists(directory):
        try:
            os.makedirs(directory)
            print(f"Répertoire {directory} créé avec succès.")
        except Exception as e:
            print(f"Erreur lors de la création du répertoire {directory}: {str(e)}")
            return jsonify({"error": f"Erreur lors de la création du répertoire {directory}: {str(e)}"}), 500

    appointment_details = {
        "praticien": {
            "name": data.get("doctorName"),
            "PraticienCentreSoinID": data.get("PcsID"),
            "timeSlot": data.get("timeSlot")
        },
        "patient": {
            "first_name": data.get("first_name"),
            "last_name": data.get("last_name"),
            "phone_number": data.get("phone_number"),
            "patientId": data.get("patientId"),
            "gpatientId": data.get("gpatientId")
        }
    }

   # Fetch the motif ID with synchronize=true
    motif_response = api_get_request(f"https://apipreprod.nabady.ma/api/motif_praticiens?teamMember={appointment_details['praticien']['PraticienCentreSoinID']}&synchronize=true")
    if motif_response and motif_response.ok:
        motifs = motif_response.json()
       # print(f"Motif Response: {json.dumps(motifs, indent=4)}")  # Print the full response for debugging
        
        if motifs and "hydra:member" in motifs and motifs["hydra:member"]:
            motifId = motifs["hydra:member"][0]["id"]
            appointment_details["motifId"] = motifId
        else:
            return jsonify({"error": "No motifs found for the doctor"}), 500
    else:
        return jsonify({"error": "Failed to fetch motifs"}), 500


    print(f"Saving appointment with details: {appointment_details}")

    # Tentative de création/mise à jour du fichier JSON
    try:
        if os.path.isfile(filepath):
            with open(filepath, 'r+') as file:
                try:
                    file_data = json.load(file)
                except json.JSONDecodeError:
                    file_data = {"praticien": {"data": []}}
                
                file_data['praticien']['data'].append(appointment_details)
                file.seek(0)
                json.dump(file_data, file, indent=4)
        else:
            with open(filepath, 'w') as file:
                json.dump({"praticien": {"data": [appointment_details]}}, file, indent=4)
        
        print(f"Fichier {filepath} mis à jour avec succès.")
    except Exception as e:
        print(f"Erreur lors de la création/mise à jour du fichier {filepath}: {str(e)}")
        return jsonify({"error": f"Erreur lors de la création/mise à jour du fichier {filepath}: {str(e)}"}), 500

    # Send the appointment data to the API
    ref = send_appointment_to_api(appointment_details, data.get("email"))

    if ref:
        return jsonify({"message": "Data saved successfully!", "ref": ref}), 200
    else:
        return jsonify({"error": "Failed to create appointment"}), 500


@app.route('/confirm_appointment', methods=['POST'])
def confirm_appointment():
    data = request.get_json()
    code = data.get('code')
    ref = data.get('ref')

    if not code or not ref:
        return jsonify({'error': 'Code or Reference ID is missing'}), 400

    confirmation_data = {
        "code": code,
        "type": "R",
        "ref": ref,
        "statusRdv": "NEW"
    }

    headers = {
        "Origin": "https://preprod.nabady.ma",
        "Content-Type": "application/json"
    }

    response = requests.post('https://apipreprod.nabady.ma/api/sms/confirm', json=confirmation_data, headers=headers)

    if response and response.status_code == 200:
        today = datetime.now().strftime("%Y-%m-%d")
        current_week = datetime.now().isocalendar()[1]
        current_year = datetime.now().year

        appointments_collection.update_one({"type": "daily", "date": today}, {"$inc": {"count": 1}}, upsert=True)
        appointments_collection.update_one({"type": "weekly", "week": current_week, "year": current_year}, {"$inc": {"count": 1}}, upsert=True)
        appointments_collection.update_one({"type": "total"}, {"$inc": {"count": 1}}, upsert=True)

        return jsonify({"message": "Appointment confirmed successfully!"}), 200
    elif response:
        print(f"Error confirming appointment: Status code {response.status_code}, {response.text}")
        return jsonify({'error': 'Failed to confirm appointment.'}), response.status_code
    else:
        print("Error: No response from the server.")
        return jsonify({'error': 'No response from confirmation API'}), 502

@app.route('/resend_otp', methods=['POST'])
def resend_otp():
    data = request.get_json()
    ref = data.get('ref')

    if not ref:
        return jsonify({'error': 'Reference ID is missing'}), 400

    resend_data = {
        "type": "R",
        "ref": ref,
        "typeNotif": "sms"
    }

    headers = {
        "Origin": "https://preprod.nabady.ma",
        "Content-Type": "application/json"
    }

    response = requests.post('https://apipreprod.nabady.ma/api/sms/resend-sms', json=resend_data, headers=headers)

    if response and response.status_code == 200:
        return jsonify({'message': 'OTP resent successfully'}), 200
    elif response:
        print(f"Error resending OTP: Status code {response.status_code}, {response.text}")
        return jsonify({'error': 'Failed to resend OTP'}), response.status_code
    else:
        print("Error: No response from the server.")
        return jsonify({'error': 'No response from resend-sms API'}), 502


@app.route('/appointment_stats', methods=['GET'])
def get_appointment_stats():
    today = datetime.now().strftime("%Y-%m-%d")
    current_week = datetime.now().isocalendar()[1]
    current_year = datetime.now().year

    # Reset daily and weekly stats if necessary
    daily_stat = appointments_collection.find_one({"type": "daily", "date": today})
    if not daily_stat:
        # If there is no stat for today, it means a new day has started
        today_count = 0
    else:
        today_count = daily_stat.get("count", 0)

    # Fetch weekly appointments count
    weekly_stat = appointments_collection.find_one({"type": "weekly", "week": current_week, "year": current_year})
    if not weekly_stat:
        # If there is no stat for the current week, it means a new week has started
        weekly_count = 0
    else:
        weekly_count = weekly_stat.get("count", 0)

    # Fetch total appointments count
    total_stat = appointments_collection.find_one({"type": "total"})
    total_count = total_stat.get("count", 0) if total_stat else 0

    return jsonify({
        "today": today_count,
        "thisWeek": weekly_count,
        "total": total_count
    }), 200

if __name__ == "__main__":
    app.run(debug=True)