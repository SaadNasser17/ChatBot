
from flask import Flask, render_template, request, jsonify
import requests

from chat import get_response

app = Flask(__name__)

@app.get("/")
def index_get():
    return render_template("base.html")

@app.post("/predict")
def predict():
    text = request.get_json().get("message")
    response = get_response(text)
    message = {"answer": response}
    return jsonify(message)

@app.route("/get_specialties")
def get_specialties():
    response = requests.get("https://apiuat.nabady.ma/api/specialites")
    specialties = response.json()
    return jsonify(specialties)
    
if __name__ == "__main__":
    app.run(debug=True)