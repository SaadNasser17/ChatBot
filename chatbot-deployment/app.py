from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import os
from datetime import datetime
import requests
from pymongo import MongoClient
import ssl 

app = Flask(__name__)
CORS(app)
app.secret_key = '1234'
JWT_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3MjA3MDE4NzAsImV4cCI6MTcyMzI5Mzg3MCwicm9sZXMiOlsiUk9MRV9NRURFQ0lOIiwiUk9MRV9VU0VSIl0sImVtYWlsIjoiY3JlYXRlcHJhdGljaWVuLnBob25lbnVtYmVyQHlvcG1haWwuY29tIn0.p34TLIVysp-HTz80Uc7_DckLK31FZ0cW7vypXwGG8NJz2cHGEWJilQvFvq9v3mfkrtbHG4P6-Q78BJxvKArFeA0CUvDLIdvCyJGN13Nfnx-lM9J8_ACvr9fG2fu-C8EEebi1RbV1oANj5ioIA6IxAEhYL3K3hOVCb6A9mQW7yFKdYDfdwLDcbfM7Z0Qk7Qvudgx7NR5O-ln6qJYB9NtMGNDzTH49gyaY6xF39REczA2MHA0UqopBztpIYZZ5uudYxNxbNLXNfLfCfRQtpvkDD1PNBt-kRQQR-q6zW35HUp_i-rDiWIlO25y7TPVPU3J0dQIcJwHGR0nqc0nCjEZsjQ"

# MongoDB connection setup
client = MongoClient(
            'mongodb+srv://snassereddine:O3LtH817wINZOcYU@nabadybotdataset.qkqs8.mongodb.net/nabadybotdataset?retryWrites=true&w=majority&appName=NabadyBotDataset',
            tls=True,
            tlsAllowInvalidCertificates=True
        )

db = client["Datasets"]
intents_collection = db["Intents"]
unrecognized_intents_collection = db["Unrecognized intents"]

fallback_messages = {
    "darija": "mafhamtch t9dr t3awd",
    "الدارجة": "مافهمتش تقدر تعاود",
    "العربية": "لم أفهم، هل يمكنك إعادة المحاولة؟",
    "francais": "Je ne comprends pas.",
    "english": "I don't understand."
}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    message = data["message"]
    selected_language = data["language"]
    
    intent_tag = get_intent(message, selected_language)
    response, tag = get_response_and_tag(intent_tag, selected_language)
    
    return jsonify({"answer": response, "tag": tag})

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
    response = requests.get("https://apipreprod.nabady.ma/api/specialites")
    specialties = response.json()
    return jsonify(specialties)

def fetch_doctors_from_api(query, consultation='undefined', page=1, result=5, isIframe=False, referrer=""):
    response = requests.post(
        "https://apipreprod.nabady.ma/api/users/medecin/search",
        json={
            "query": query,
            "consultation": consultation,
            "page": page,
            "result": result,
            "isIframe": isIframe,
            "referrer": referrer
        }
    )
    if response.status_code == 200:
        doctors = response.json()['praticien']['data']
        for doctor in doctors:
            pcs_id = doctor['PcsID']
            appointments_response = requests.get(f"https://apipreprod.nabady.ma/api/holidays/praticienCs/{pcs_id}/day/0/limit/2")
            if appointments_response.ok:
                unavailable_times = appointments_response.json()
                doctor['available_slots'] = filter_available_slots(doctor['agendaConfig'], unavailable_times)
            else:
                doctor['available_slots'] = []
        return doctors
    else:
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

    response = requests.post('https://apipreprod.nabady.ma/api/users/register', json=user_data)

    if response.status_code == 201:
        data = response.json()
        patient_id = data["user"]["id"]
        gpatient_id = data["user"]["gpatient"]["id"]
        print(f"Patient ID: {patient_id}, GPatient ID: {gpatient_id}")
        return jsonify({'message': 'User registered successfully!', 'patient_id': patient_id, 'gpatient_id': gpatient_id}), 201
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return jsonify({'error': 'Failed to register user'}), response.status_code

@app.route("/get_doctors", methods=["POST"])
def get_doctors():
    data = request.get_json()
    specialty_name = data.get("specialty_name")
    doctors_data = fetch_doctors_from_api(query=specialty_name)
    if doctors_data:
        return jsonify(doctors_data)
    else:
        return jsonify({"error": "Failed to fetch doctors"}), 500

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

def filter_available_slots(agendaConfig, unavailable_times):
    available_slots = []
    opening_hour = int(agendaConfig['heureOuverture'].split(":")[0])
    closing_hour = int(agendaConfig['heureFermeture'].split(":")[0])
    granularity_hours, granularity_minutes = map(int, agendaConfig['granularite'].split(":"))

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
        session['appointment_details'] = {}

    if step == 1:
        session['appointment_details']['first_name'] = response
    elif step == 2:
        session['appointment_details']['last_name'] = response
    elif step == 3:
        session['appointment_details']['phone_number'] = response

        return jsonify({"message": "Response processed", "next_step": step + 1, "complete": True})
    
    session.modified = True
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

    # Fetch the motif ID
    motif_response = requests.get(f"https://apipreprod.nabady.ma/api/motif_praticiens?teamMember={appointment_details['praticien']['PraticienCentreSoinID']}")
    if motif_response.ok:
        motifs = motif_response.json()
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
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Content-Type": "application/json"
    }

    response = requests.post('https://apipreprod.nabady.ma/api/agenda_evenements/prise-rdv', json=appointment_data, headers=headers)

    if response.status_code in [200, 201]:
        response_data = response.json()
        ref = response_data.get('id')
        print("Appointment created successfully. Response:", response_data)
        return ref
    else:
        # Remplacez cet appel à log_error par un simple print
        print(f"Failed to create appointment. Status code: {response.status_code}, Response: {response.text}")
        print({
            "status_code": response.status_code,
            "response_text": response.text,
            "request_body": appointment_data
        })
        return None



@app.route('/confirm_appointment', methods=['POST'])
def confirm_appointment():
    data = request.get_json()
    code = data.get('code')
    ref = data.get('ref')

    confirmation_data = {
        "code": code,
        "type": "R",
        "ref": ref
    }

    headers = {
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Content-Type": "application/json"
    }

    response = requests.post('https://apipreprod.nabady.ma/api/sms/confirm', json=confirmation_data, headers=headers)

    if response.status_code == 200:
        return jsonify({"message": "Appointment confirmed successfully!"}), 200
    else:
        return jsonify({"error": "Failed to confirm appointment."}), response.status_code

if __name__ == "__main__":
    app.run(debug=True)