from flask import Flask, render_template, request, jsonify
import requests
import json
import random
import os
app = Flask(__name__)

intents_data = {}


with open('intents.json', 'r', encoding='utf-8') as file:
    intents_data = json.load(file)

def get_response(message):
    for intent in intents_data["intents"]:
        # Convertissez tous les modèles en minuscules pour une comparaison insensible à la casse
        if message.lower() in (pattern.lower() for pattern in intent["patterns"]):
            return random.choice(intent["responses"])
    return "Mafhamtch t9der t3awd"

@app.get("/")
def index_get():
    return render_template("base.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    message = data["message"]
    intent_tag = get_intent(message)  # Use get_intent function to find intent tag
    response, tag = get_response_and_tag(intent_tag)  # Get response based on intent tag
    return jsonify({"answer": response, "tag": tag})

def get_intent(message):
    message = message.lower()
    for intent in intents_data["intents"]:
        for pattern in intent["patterns"]:
            # Simple pattern matching
            if pattern.lower() in message:
                return intent["tag"]
    return "default"

def get_response_and_tag(intent_tag):
    for intent in intents_data["intents"]:
        if intent["tag"] == intent_tag:
            response = random.choice(intent["responses"])
            return response, intent_tag
    # Default response if no intent is found
    return "Mafhemtch t9dr t3wad ?", "default"

@app.route("/get_specialties")
def get_specialties():
    response = requests.get("https://apiuat.nabady.ma/api/specialites")
    specialties = response.json()
    return jsonify(specialties)


@app.route("/get_doctors", methods=["POST"])
def get_doctors():
    data = request.get_json()
    specialty_name = data.get("specialty_name")
    
    # Corrected the request to match the API specifications you've provided.
    response = requests.post(
        "https://apiuat.nabady.ma/api/users/medecin/search",
        json={
            "query": specialty_name,
            "consultation": "undefined",
            "page": 1,
            "result": 5,
            "isIframe": False,
            "referrer": ""
        }
    )
    
    # Check the status code of the response to ensure it's successful
    if response.status_code == 200:
        doctors_data = response.json()
        return jsonify(doctors_data)
    else:
        return jsonify({"error": "Failed to fetch doctors"}), 500

@app.route("/get_doctor_appointments_by_name", methods=["POST"])
def get_doctor_appointments_by_name():
    data = request.get_json()
    doctor_name = data.get("doctor_name")

    # Recherchez le médecin pour obtenir l'ID praticienCentreSoins
    response = requests.post(
        "https://apiuat.nabady.ma/api/users/medecin/search",
        json={
            "query": doctor_name,
            # Ajoutez ici les autres paramètres nécessaires pour la requête API
        }
    )
    
    if response.ok:
        doctors_data = response.json()
        
        # Supposons que doctors_data['praticien']['data'] contient les infos des médecins
        for doctor_info in doctors_data['praticien']['data']:
            if doctor_name.lower() in (doctor_info['0']['lastname'].lower(), doctor_info['0']['firstname'].lower()):
                praticien_centre_soin_id = doctor_info['0']['praticienCentreSoins'][0]['id']
                
                # Maintenant que nous avons l'ID, obtenons les rendez-vous du médecin
                appointments_response = requests.get(f"https://apiuat.nabady.ma/api/holidays/praticienCs/{praticien_centre_soin_id}/day/0/limit/3")
                if appointments_response.ok:
                    return jsonify(appointments_response.json()), 200
                else:
                    return jsonify({"error": "Failed to fetch appointments"}), appointments_response.status_code
                
        return jsonify({"error": "Doctor not found"}), 404
    else:
        return jsonify({"error": "Failed to search doctors"}), response.status_code
    
@app.route('/get_doctors_agenda', methods=['GET'])
def get_doctors_agenda():
    url = 'https://apiuat.nabady.ma/api/users/medecin/search'
    data = {
        "query": "",  # Modify this query as needed to fetch specific doctors or all doctors
        "consultation": "undefined",
        "page": 1,
        "result": 5,  # You can adjust this number based on how many results you want
        "isIframe": False,
        "referrer": ""
    }
    headers = {'Content-Type': 'application/json'}

    response = requests.post(url, json=data, headers=headers)
    if response.status_code == 200:
        doctors = response.json()['praticien']['data']
        results = []
        for doctor in doctors:
            if 'agendaConfig' in doctor:
                agenda_config = doctor['agendaConfig']
                results.append({
                    'name': f"{doctor.get('firstname', '').strip()} {doctor.get('lastname', '').strip()}",
                    'praticien_centre_soin_id': doctor['id'],
                    'agenda_config': agenda_config
                })
        return jsonify(results)
    else:
        return jsonify({'error': 'Failed to fetch doctors'}), response.status_code

@app.route('/save_appointment', methods=['POST'])
def save_appointment():
    data = request.get_json()  # Get data sent from the frontend
    directory = '/path/to/your/directory'  # Set this to your desired folder
    filename = 'appointments.json'
    
    # Combine path and filename
    filepath = os.path.join(directory, filename)
    
    # Check if file exists, append to it if it does
    if os.path.isfile(filepath):
        with open(filepath, 'r+') as file:
            file_data = json.load(file)
            file_data['praticien']['data'].append(data)  # Append new data
            file.seek(0)
            json.dump(file_data, file, indent=4)
    else:
        # If the file doesn't exist, create it and write the data
        with open(filepath, 'w') as file:
            json.dump({"praticien": {"data": [data]}}, file, indent=4)

    return jsonify({"message": "Data saved successfully!"})

@app.route('/submit_details', methods=['POST'])
def submit_details():
    data = request.json
    userName = data['userName']
    userPhone = data['userPhone']
    doctorName = data['doctorName']
    timeSlot = data['timeSlot']
    
    # Store the details in JSON or CSV as needed
    # ... Your logic for storage ...

    # Create a recap message
    recap_message = f"hahoma lma3lomat dyalk\n{userName}\n{userPhone}\n{doctorName}\n{timeSlot}"
    
    # Send recap message back to frontend
    return jsonify({'recapMessage': recap_message})
if __name__ == "__main__":
    app.run(debug=True)
