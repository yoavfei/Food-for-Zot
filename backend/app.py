# file for flask backend routing

import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Initialize Firebase
cred = credentials.Certificate("food-for-zot-firebase-adminsdk-fbsvc-f018325808.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/api/users', methods=['GET'])
def get_users():
    users = []
    docs = db.collection('users').stream()
    for doc in docs:
        user = doc.to_dict()
        user['id'] = doc.id
        users.append(user)
    return jsonify(users)

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    doc_ref = db.collection('users').add(data)
    return jsonify({'id': doc_ref[1].id}), 201

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    doc = db.collection('users').document(user_id).get()
    if doc.exists:
        return jsonify(doc.to_dict())
    return jsonify({'error': 'User not found'}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)