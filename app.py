from flask import Flask, render_template, request, jsonify
import requests
import json
import random

app = Flask(__name__)

# Chargez les intentions depuis le fichier JSON
with open('intents.json', 'r', encoding='utf-8') as file:
    intents_data = json.load(file)

def get_response(message):
    for intent in intents_data["intents"]:
        # Convertissez tous les modèles en minuscules pour une comparaison insensible à la casse
        if message.lower() in (pattern.lower() for pattern in intent["patterns"]):
            return random.choice(intent["responses"])
    return "Je ne comprends pas bien. Pouvez-vous préciser votre demande ?"

@app.get("/")
def index_get():
    return render_template("base.html")

@app.post("/predict")
def predict():
    text = request.get_json().get("message")
    response = get_response(text)
    return jsonify({"answer": response})

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


@app.route('/get_doctor_details', methods=['POST'])
def get_doctor_details():
    doctor_id = request.json.get('doctorId')
    doctor_details = {'agendaConfig': 'Doctor agenda details here'}
    return jsonify(doctor_details)

    

if __name__ == "__main__":
    app.run(debug=True)
