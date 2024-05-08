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

def fetch_doctors_from_api(query, consultation='undefined', page=1, result=5, isIframe=False, referrer=""):
    response = requests.post(
        "https://apiuat.nabady.ma/api/users/medecin/search",
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
            appointments_response = requests.get(f"https://apiuat.nabady.ma/api/holidays/praticienCs/{pcs_id}/day/0/limit/1")
            if appointments_response.ok:
                unavailable_times = appointments_response.json()
                doctor['available_slots'] = filter_available_slots(doctor['agendaConfig'], unavailable_times)
            else:
                doctor['available_slots'] = []
        return doctors
    else:
        return None


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
    # Assuming you want to fetch all doctors for the agenda view
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


def get_doctor_appointments_by_name():
    data = request.get_json()
    doctor_name = data.get("doctor_name")
    doctors_data = fetch_doctors_from_api(query=doctor_name)
    if doctors_data:
        for doctor in doctors_data:
            doc_full_name = f"{doctor['0']['firstname']} {doctor['0']['lastname']}"
            if doctor_name.lower() in doc_full_name.lower():
                return jsonify(doctor['unavailable_times']), 200
        return jsonify({"error": "Doctor not found"}), 404
    else:
        return jsonify({"error": "Failed to search doctors"}), 500

def filter_available_slots(agenda_config, unavailable_times):
    # Assuming agenda_config and unavailable_times are properly structured,
    # implement logic here to filter out unavailable times.
    # This function should return a list of filtered available slots.
    pass


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

def load_data(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return {item["Medication"]: item["Price Information"] for item in data}

# Preload medication data
medication_dict = load_data('datasets/csvjson.json')

@app.route('/get_medication_price', methods=['POST'])
def get_medication_price():
    data = request.json
    medication_name = data.get('medication_name', '')
    price_info = medication_dict.get(medication_name, "Medication not found.")
    return jsonify({'medication_name': medication_name, 'price_information': price_info})


if __name__ == "__main__":
    app.run(debug=True)
