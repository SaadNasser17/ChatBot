from flask import Flask, request, jsonify, session
from flask_cors import CORS
import requests
import json
import random
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
app.secret_key = '1234'
JWT_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3MTc0MDg5MjYsImV4cCI6MTcyMDAwMDkyNiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImVtYWlsIjoicGF0MUB5b3BtYWlsLmNvbSJ9.d6LU67vvR9ErGCEZ5hqWWXd0Ax0-iQWtNEP58wp186uxFyZQeTIyRZ_femAr0S_-szuou_jYeAE56clo6qDcX1MBW_eaI4PIyqIYCf1mei5cAwMIp6DUu39ySsdlxJj-4Iv1fFkwae-buFDCzZwyq7J5MTUTcTptF0H_j7iEcV3ckAkiv1jbTVenAjFiP79KU_RaykZvn2z-4FIoWR_K0F1nulYM-bE0RdCzi3TQDJje6QlW4jdwabM7cLk5HkcBcUHIEGy2dOCiem3luz-R7P47h9lMKie3o4flxHUiVJahin5KaKYdqmQu5nNdrMygmkzveHABvEkZMdXwbjYvPQ"

intents_data = {}

with open('intents.json', 'r', encoding='utf-8') as file:
    intents_data = json.load(file)

def get_response(message):
    for intent in intents_data["intents"]:
        if message.lower() in (pattern.lower() for pattern in intent["patterns"]):
            return random.choice(intent["responses"])
    return "Mafhamtch t9der t3awd"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    message = data["message"]
    intent_tag = get_intent(message)
    response, tag = get_response_and_tag(intent_tag)
    return jsonify({"answer": response, "tag": tag})

def get_intent(message):
    message = message.lower()
    for intent in intents_data["intents"]:
        for pattern in intent["patterns"]:
            if pattern.lower() in message:
                return intent["tag"]
    return "default"

def get_response_and_tag(intent_tag):
    for intent in intents_data["intents"]:
        if intent["tag"] == intent_tag:
            response = random.choice(intent["responses"])
            return response, intent_tag
    return "Mafhemtch t9dr t3wad ?", "default"

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
