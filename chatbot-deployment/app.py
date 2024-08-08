from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import os
from datetime import datetime
import requests

app = Flask(__name__)
CORS(app)
app.secret_key = '1234'
JWT_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3MjA3MDE4NzAsImV4cCI6MTcyMzI5Mzg3MCwicm9sZXMiOlsiUk9MRV9NRURFQ0lOIiwiUk9MRV9VU0VSIl0sImVtYWlsIjoiY3JlYXRlcHJhdGljaWVuLnBob25lbnVtYmVyQHlvcG1haWwuY29tIn0.p34TLIVysp-HTz80Uc7_DckLK31FZ0cW7vypXwGG8NJz2cHGEWJilQvFvq9v3mfkrtbHG4P6-Q78BJxvKArFeA0CUvDLIdvCyJGN13Nfnx-lM9J8_ACvr9fG2fu-C8EEebi1RbV1oANj5ioIA6IxAEhYL3K3hOVCb6A9mQW7yFKdYDfdwLDcbfM7Z0Qk7Qvudgx7NR5O-ln6qJYB9NtMGNDzTH49gyaY6xF39REczA2MHA0UqopBztpIYZZ5uudYxNxbNLXNfLfCfRQtpvkDD1PNBt-kRQQR-q6zW35HUp_i-rDiWIlO25y7TPVPU3J0dQIcJwHGR0nqc0nCjEZsjQ"
intents_data = {}
unrecognized_words_file = 'unrecognized_words.json'

intents_file_arabic = 'intents_arabic.json'
intents_file_darija = 'intents_darija.json'
intents_file_darija2 = 'intents_darija2.json'
intents_file_english = 'intents_english.json'
intents_file_francais = 'intents_francais.json'

with open(intents_file_arabic, 'r', encoding='utf-8') as file:
    intents_data_arabic = json.load(file)

with open(intents_file_darija, 'r', encoding='utf-8') as file:
    intents_data_darija = json.load(file)

with open(intents_file_darija2, 'r', encoding='utf-8') as file:
    intents_data_darija2 = json.load(file)

with open(intents_file_english, 'r', encoding='utf-8') as file:
    intents_data_english = json.load(file)

with open(intents_file_francais, 'r', encoding='utf-8') as file:
    intents_data_francais = json.load(file)

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

    if language == "العربية":
        intents_data = intents_data_arabic
    elif language == "darija":
        intents_data = intents_data_darija
    elif language == "الدارجة":
        intents_data = intents_data_darija2
    elif language == "english":
        intents_data = intents_data_english
    elif language == "francais":
        intents_data = intents_data_francais
    else:
        return "default"

    for intent in intents_data["intents"]:
        for pattern in intent["patterns"]:
            if pattern.lower() in message:
                return intent["tag"]

    store_unrecognized_word(message, language)
    return "default"


fallback_messages = {
    "darija": "mafhamtch t9dr t3awd",
    "الدارجة": "مافهمتش تقدر تعاود",
    "العربية": "لم أفهم، هل يمكنك إعادة المحاولة؟",
    "francais": "Je ne comprends pas.",
    "english": "I don't understand."
}

def get_response_and_tag(intent_tag, language):
    if language == "العربية":
        intents_data = intents_data_arabic
    elif language == "darija":
        intents_data = intents_data_darija
    elif language == "الدارجة":
        intents_data = intents_data_darija2
    elif language == "english":
        intents_data = intents_data_english
    elif language == "francais":
        intents_data = intents_data_francais
    else:
        return fallback_messages["english"], "default"

    for intent in intents_data["intents"]:
        if intent["tag"] == intent_tag:
            return random.choice(intent["responses"]), intent_tag

    return fallback_messages[language], "default"



def increment_session_counter():
    try:
        with open(unrecognized_words_file, 'r') as file:
            try:
                data = json.load(file)
            except json.JSONDecodeError:
                data = []
    except FileNotFoundError:
        data = []

    if data:
        session_counter = data[-1]["session_counter"] + 1
    else:
        session_counter = 1

    data.append({"session_counter": session_counter, "unrecognized_words": []})

    with open(unrecognized_words_file, 'w') as file:
        json.dump(data, file, indent=4)

    return session_counter

def store_unrecognized_word(message, language):
    filename = f'unrecognized_words_{language}.json'
    
    try:
        with open(filename, 'r+', encoding='utf-8') as file:
            data = json.load(file)
            data.append(message)
            file.seek(0)
            json.dump(data, file, ensure_ascii=False, indent=4)
    except FileNotFoundError:
        with open(filename, 'w', encoding='utf-8') as file:
            json.dump([message], file, ensure_ascii=False, indent=4)

@app.route('/increment_session_counter', methods=['POST'])
def increment_session():
    session_counter = increment_session_counter()
    return jsonify({"message": "Session counter incremented", "session_counter": session_counter}), 201




@app.route('/unrecognized_intents', methods=['GET'])
def get_unrecognized_intents():
    try:
        unrecognized_intents = {
            'darija': [],
            'english': [],
            'francais': [],
            'الدارجة': [],
            'العربية': []
        }

        files = {
            'darija': 'unrecognized_words_darija.json',
            'english': 'unrecognized_words_english.json',
            'francais': 'unrecognized_words_francais.json',
            'الدارجة': 'unrecognized_words_الدارجة.json',
            'العربية': 'unrecognized_words_العربية.json'
        }

        for language, file in files.items():
            if os.path.exists(file):
                with open(file, 'r', encoding='utf-8') as f:
                    unrecognized_intents[language] = json.load(f)

        print(unrecognized_intents)  # Debug statement to check the data
        return jsonify({'unrecognized_intents': unrecognized_intents}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add_intent/<language>', methods=['POST'])
def add_intent(language):
    data = request.get_json()
    new_intent = {
        "tag": data['tag'],
        "patterns": data['patterns'].split(','),
        "responses": data['responses'].split(',')
    }

    files = {
        'darija': 'intents_darija.json',
        'الدارجة': 'intents_الدارجة.json',
        'العربية': 'intents_arabic.json',
        'francais': 'intents_francais.json',
        'english': 'intents_english.json'
    }

    unrecognized_files = {
        'darija': 'unrecognized_words_darija.json',
        'الدارجة': 'unrecognized_words_الدارجة.json',
        'العربية': 'unrecognized_words_العربية.json',
        'francais': 'unrecognized_words_francais.json',
        'english': 'unrecognized_words_english.json'
    }

    try:
        if language in files:
            with open(files[language], 'r+', encoding='utf-8') as file:
                intents_data = json.load(file)
                intents_data["intents"].append(new_intent)
                file.seek(0)
                json.dump(intents_data, file, ensure_ascii=False, indent=4)

            with open(unrecognized_files[language], 'r+', encoding='utf-8') as file:
                unrecognized_data = json.load(file)
                for pattern in new_intent["patterns"]:
                    if pattern in unrecognized_data:
                        unrecognized_data.remove(pattern)
                file.seek(0)
                file.truncate()
                json.dump(unrecognized_data, file, ensure_ascii=False, indent=4)

            return jsonify({"message": "Intent added and removed from unrecognized intents successfully"}), 201
        else:
            return jsonify({"error": "Invalid language"}), 400
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
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
    directory = 'ChatBot/chatbot-deployment'
    filename = 'appointments.json'
    filepath = os.path.join(directory, filename)

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

    if os.path.isfile(filepath):
        with open(filepath, 'r+') as file:
            file_data = json.load(file)
            file_data['praticien']['data'].append(appointment_details)
            file.seek(0)
            json.dump(file_data, file, indent=4)
    else:
        with open(filepath, 'w') as file:
            json.dump({"praticien": {"data": [appointment_details]}}, file, indent=4)

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

    if response.status_code == 201 or response.status_code == 200:
        response_data = response.json()
        ref = response_data.get('id')
        print("Appointment created successfully. Response:", response_data)
        return ref
    else:
        print(f"Failed to create appointment. Status code: {response.status_code}, Response: {response.text}")
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
