# File for flask backend routing

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

@app.route('/')
def home():
    return 'Page for backend testing'

@app.route('/api/users', methods=['GET'])
def get_users():
    users = []
    docs = db.collection('users').stream()
    for doc in docs:
        user = doc.to_dict()
        user['id'] = doc.id
        users.append(user)
    return jsonify(users)

#########################################################
# CRUD for users

@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        doc_ref = db.collection("users").add(data)
        return jsonify({"id": doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        doc = db.collection('users').document(user_id).get()
        if doc.exists:
            return jsonify(doc.to_dict())
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<user_id>', methods=['PATCH'])
def update_user(user_id):
    try:
        data = request.get_json()
        doc_ref = db.collection("users").document(user_id)
        if not doc_ref.get().exists:
            return jsonify({"error": "User not found"}), 404
        doc_ref.update(data)
        return jsonify({"message": "User updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        doc_ref = db.collection("users").document(user_id)
        if not doc_ref.get().exists:
            return jsonify({"error": "User not found"}), 404
        doc_ref.delete()
        return jsonify({"message": "User deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

######################################################
# CRUD for grocery lists

@app.route('/api/lists', methods=['POST'])
def create_grocery_list():
    try:
        data = request.get_json()
        doc_ref = db.collection("lists").add(data)
        return jsonify({"id": doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<user_id>', methods=['GET'])
def get_grocery_list(user_id):
    try:
        doc = db.collection('lists').document(user_id).get()
        if doc.exists:
            return jsonify(doc.to_dict())
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<user_id>', methods=['PATCH'])
def update_grocery_list(user_id):
    try:
        data = request.get_json()
        doc_ref = db.collection("lists").document(user_id)
        if not doc_ref.get().exists:
            return jsonify({"error": "User not found"}), 404
        doc_ref.update(data)
        return jsonify({"message": "Grocery list updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<user_id>', methods=['DELETE'])
def delete_grocery_list(user_id):
    try:
        doc_ref = db.collection("lists").document(user_id)
        if not doc_ref.get().exists:
            return jsonify({"error": "User not found"}), 404
        doc_ref.delete()
        return jsonify({"message": "Grocery list deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#######################################################  
# CRUD for recipe lists

@app.route('/api/recipes', methods=['POST'])
def create_recipe_list():
    try:
        data = request.get_json()
        doc_ref = db.collection("recipes").add(data)
        return jsonify({"id": doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<user_id>', methods=['GET'])
def get_recipe_list(user_id):
    try:
        doc = db.collection('recipes').document(user_id).get()
        if doc.exists:
            return jsonify(doc.to_dict())
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<user_id>', methods=['PATCH'])
def update_recipe_list(user_id):
    try:
        data = request.get_json()
        doc_ref = db.collection("recipes").document(user_id)
        if not doc_ref.get().exists:
            return jsonify({"error": "User not found"}), 404
        doc_ref.update(data)
        return jsonify({"message": "Recipe list updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<user_id>', methods=['DELETE'])
def delete_recipe_list(user_id):
    try:
        doc_ref = db.collection("recipes").document(user_id)
        if not doc_ref.get().exists:
            return jsonify({"error": "User not found"}), 404
        doc_ref.delete()
        return jsonify({"message": "Recipe list deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # This is for testing only
    # To see a page's output, go to [port web link]/[path to page]
    app.run(debug=True, port=5000)