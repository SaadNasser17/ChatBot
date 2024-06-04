# app.py

from flask import Flask, request, jsonify, session
from flask_cors import CORS
import requests
import json
import random
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
app.secret_key = '1234'

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
            pcs_id = doctor['0']['praticienCentreSoins'][0]['id']
            appointments_response = requests.get(f"https://apipreprod.nabady.ma/api/holidays/praticienCs/{PcsID}/day/0/limit/1")
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
        gpatient_id = data["user"]["gpatient"]["id"] if data["user"]["gpatient"] else None
        print(f"Patient ID: {patient_id}, GPatient ID: {gpatient_id}")  # Print the patient and gpatient IDs
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

def filter_available_slots(agenda_config, unavailable_times):
    pass

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
    motif_famille_id = data["motifFamilleId"]
    print(f"Received motifFamilleId: {motif_famille_id}")
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
        },
        "motifFamilleId": data["motifFamilleId"]  # Access motifFamilleId directly from the request body
    }

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

    return jsonify({"message": "Data saved successfully!"})


@app.route('/get_motifs')
def get_motifs():
    PcsID = request.args.get('PcsID')
    print(f"Fetching motifs for PcsID: {PcsID}")  # Log the PcsID

    response = requests.get(f"https://apipreprod.nabady.ma/api/motif_praticiens?teamMember={PcsID}")
    print(f"API response status: {response.status_code}")  # Log the response status
    if response.ok:
        motifs = response.json()
        print("Motifs fetched:", motifs)  # Log the fetched motifs
        return jsonify(motifs)
    else:
        print("Failed to fetch motifs")  # Log failure
        return jsonify({'error': 'Failed to fetch motifs'}), response.status_code


if __name__ == "__main__":
    app.run(debug=True)
