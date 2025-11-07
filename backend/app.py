# File for flask backend routing

import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, jsonify, request
from flask_cors import CORS
from scraper.scrapers import get_walmart_prices, get_target_prices, get_kroger_prices

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
    
######################################################
# CRUD for individual grocery list items

@app.route('/api/lists/<user_id>/groceries', methods=['POST'])
def create_grocery_list_item(user_id):
    try:
        data = request.get_json()
        new_item = data.get("grocery")
        if not new_item:
            return jsonify({"error": "Missing 'grocery' in request"}), 400
        doc_ref = db.collection("lists").document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "User not found"}), 404
        doc_ref.update({
            "groceries": firestore.ArrayUnion([new_item])
        })
        return jsonify({"message": f"Grocery '{new_item}' added"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<user_id>/groceries', methods=['GET'])
def get_grocery_list_items(user_id):
    try:
        doc_ref = db.collection("lists").document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "User not found"}), 404
        data = doc.to_dict()
        items = data.get("groceries", [])
        return jsonify({"groceries": items}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/lists/<user_id>/groceries/<int:index>', methods=['GET'])
def get_grocery_list_item(user_id, index):
    doc_ref = db.collection("lists").document(user_id)
    doc = doc_ref.get()
    if not doc.exists:
        return jsonify({"error": "User not found"}), 404
    items = doc.to_dict().get("groceries", [])
    if index < 0 or index >= len(items):
        return jsonify({"error": "Index out of range"}), 404
    return jsonify({"grocery": items[index]}), 200

@app.route('/api/lists/<user_id>/groceries/<int:index>', methods=['PATCH'])
def update_grocery_list_item(user_id, index):
    try:
        data = request.get_json()
        new_value = data.get("grocery")
        if new_value is None:
            return jsonify({"error": "Missing 'grocery' in request"}), 400
        doc_ref = db.collection("lists").document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "User not found"}), 404
        items = doc.to_dict().get("groceries", [])
        if index < 0 or index >= len(items):
            return jsonify({"error": "Index out of range"}), 404
        items[index] = new_value
        doc_ref.update({"groceries": items})
        return jsonify({"message": f"Grocery at index {index} updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<user_id>/groceries', methods=['DELETE'])
def delete_grocery_list_item(user_id):
    try:
        data = request.get_json()
        value = data.get("grocery")
        if not value:
            return jsonify({"error": "Missing 'grocery' in request"}), 400
        doc_ref = db.collection("lists").document(user_id)
        doc_ref.update({
            "groceries": firestore.ArrayRemove([value])
        })
        return ('', 204)
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

#######################################################  
# CRUD for recipe list items

@app.route('/api/recipes/<user_id>/recipes', methods=['POST'])
def create_recipe_list_item(user_id):
    try:
        data = request.get_json()
        new_item = data.get("recipe")
        if not new_item:
            return jsonify({"error": "Missing 'recipe' in request"}), 400
        doc_ref = db.collection("recipes").document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "User not found"}), 404
        doc_ref.update({
            "recipes": firestore.ArrayUnion([new_item])
        })
        return jsonify({"message": f"Recipe '{new_item}' added"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<user_id>/recipes', methods=['GET'])
def get_recipe_list_items(user_id):
    try:
        doc_ref = db.collection("recipes").document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "User not found"}), 404
        data = doc.to_dict()
        items = data.get("recipes", [])
        return jsonify({"recipes": items}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/recipes/<user_id>/recipes/<int:index>', methods=['GET'])
def get_recipe_list_item(user_id, index):
    doc_ref = db.collection("recipes").document(user_id)
    doc = doc_ref.get()
    if not doc.exists:
        return jsonify({"error": "User not found"}), 404
    items = doc.to_dict().get("recipes", [])
    if index < 0 or index >= len(items):
        return jsonify({"error": "Index out of range"}), 404
    return jsonify({"recipe": items[index]}), 200

@app.route('/api/recipes/<user_id>/recipes/<int:index>', methods=['PATCH'])
def update_recipe_list_item(user_id, index):
    try:
        data = request.get_json()
        new_value = data.get("recipe")
        if new_value is None:
            return jsonify({"error": "Missing 'recipe' in request"}), 400
        doc_ref = db.collection("lists").document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "User not found"}), 404
        items = doc.to_dict().get("recipes", [])
        if index < 0 or index >= len(items):
            return jsonify({"error": "Index out of range"}), 404
        items[index] = new_value
        doc_ref.update({"recipes": items})
        return jsonify({"message": f"recipe at index {index} updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<user_id>/recipes', methods=['DELETE'])
def delete_recipe_list_item(user_id):
    try:
        data = request.get_json()
        value = data.get("recipe")
        if not value:
            return jsonify({"error": "Missing 'recipe' in request"}), 400
        doc_ref = db.collection("recipes").document(user_id)
        doc_ref.update({
            "recipes": firestore.ArrayRemove([value])
        })
        return ('', 204)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

#######################################################
# Web scrape for prices

@app.route("/api/prices", methods=["GET"])
def get_prices():
    item = request.args.get("grocery")
    if not item:
        return jsonify({"error": "Missing 'grocery' query parameter"}), 400

    results = {}
    try:
        print(results, 'before')
        results["walmart"] = get_walmart_prices(item)
        print(results, 'walmart')
        results["target"] = get_target_prices(item)
        print(results, 'target')
        results["kroger"] = get_kroger_prices(item)
        print(results, 'kroger')
    except Exception as e:
        results = {
            "walmart": [{"name": "Eggs", "price": "$3.49"}],
            "target": [{"name": "Eggs", "price": "$4.29"}],
            "kroger": [{"name": "Eggs", "price": "$4.99"}],
        }

    return jsonify({"grocery": item, "results": results})



if __name__ == "__main__":
    # This is for testing only
    # To see a page's output, go to [port web link]/[path to page]
    app.run(debug=True, port=5000)