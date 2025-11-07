from flask import Flask, jsonify, request
from flask_cors import CORS
from scraper.scrapers import get_walmart_prices, get_target_prices, get_kroger_prices
from firebase_admin import firestore
import ast

from firebase_setup import db
import recipe_functions

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return 'Page for backend testing'

#########################################################
# CRUD for Users
#########################################################

@app.route('/api/users', methods=['POST'])
def create_user():
    """
    Creates a new user document.
    EXPECTS: { "email": "...", "uid": "..." } from the frontend.
    The 'uid' MUST match the Firebase Auth UID.
    """
    try:
        data = request.get_json()
        uid = data.get('uid')
        if not uid:
            return jsonify({"error": "Missing 'uid' in request"}), 400
        
        # Create the doc using the UID as the ID
        doc_ref = db.collection("users").document(uid)
        
        new_user_data = {
            'email': data.get('email'),
            'name': '',
            'preferences': {'dark_mode': False},
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        
        doc_ref.set(new_user_data) # Use .set() to create
        return jsonify({"id": uid}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    # This route is fine, it fetches a single user doc
    try:
        doc = db.collection('users').document(user_id).get()
        if doc.exists:
            return jsonify(doc.to_dict())
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<user_id>', methods=['PATCH'])
def update_user(user_id):
    # This route is fine, it updates a single user doc
    try:
        data = request.get_json()
        doc_ref = db.collection("users").document(user_id)
        if not doc_ref.get().exists:
            return jsonify({"error": "User not found"}), 404
        doc_ref.update(data)
        return jsonify({"message": "User updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

######################################################
# CRUD for Lists
# /api/lists
# /api/lists/<list_id>
######################################################

@app.route('/api/lists', methods=['POST'])
def create_list():
    """ Creates a new list document in the top-level /lists collection. """
    try:
        data = request.get_json() # e.g., { "listName": "New List", "ownerId": "..." }
        data['createdAt'] = firestore.SERVER_TIMESTAMP
        
        doc_ref = db.collection("lists").add(data)
        return jsonify({"id": doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists', methods=['GET'])
def get_user_lists():
    """ Gets all lists for a user. """
    try:
        # Get user ID from query param: /api/lists?userId=abc
        user_id = request.args.get('userId') 
        if not user_id:
            return jsonify({"error": "Missing 'userId' query parameter"}), 400

        lists = []
        # Query the /lists collection for docs where 'ownerId' matches
        docs = db.collection('lists').where('ownerId', '==', user_id).stream()
        for doc in docs:
            list_data = doc.to_dict()
            list_data['id'] = doc.id
            lists.append(list_data)
        return jsonify(lists), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<list_id>', methods=['DELETE'])
def delete_list(list_id):
    """ Deletes a single list document. """
    try:
        db.collection("lists").document(list_id).delete()
        return ('', 204)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

######################################################
# CRUD for List Items
# /api/lists/<list_id>/items
# /api/lists/<list_id>/items/<item_id>
######################################################

@app.route('/api/lists/<list_id>/items', methods=['POST'])
def create_list_item(list_id):
    """ Creates a new item document in a list's /items subcollection. """
    try:
        data = request.get_json() # e.g., { "name": "Milk", "purchased": false }
        
        # Add the item to the subcollection
        doc_ref = db.collection("lists").document(list_id).collection("items").add(data)
        return jsonify({"id": doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<list_id>/items', methods=['GET'])
def get_list_items(list_id):
    """ Gets all items from a list's /items subcollection. """
    try:
        items = []
        docs = db.collection("lists").document(list_id).collection("items").stream()
        for doc in docs:
            item_data = doc.to_dict()
            item_data['id'] = doc.id
            items.append(item_data)
        return jsonify(items), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<list_id>/items/<item_id>', methods=['PATCH'])
def update_list_item(list_id, item_id):
    """ Updates a single item document in a subcollection. """
    try:
        data = request.get_json() # e.g., { "purchased": true }
        doc_ref = db.collection("lists").document(list_id).collection("items").document(item_id)
        doc_ref.update(data)
        return jsonify({"message": "Item updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<list_id>/items/<item_id>', methods=['DELETE'])
def delete_list_item(list_id, item_id):
    """ Deletes a single item document from a subcollection. """
    try:
        doc_ref = db.collection("lists").document(list_id).collection("items").document(item_id)
        doc_ref.delete()
        return ('', 204)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

####################################################### 
# CRUD for Recipes
# /api/recipes
# /api/recipes/<recipe_id>
#######################################################

@app.route('/api/recipes', methods=['POST'])
def create_recipe():
    """ Creates a new recipe document in the top-level /recipes collection. """
    try:
        data = request.get_json() # e.g., { "name": "...", "ingredients": [...], "ownerId": "..." }
        data['createdAt'] = firestore.SERVER_TIMESTAMP
        
        doc_ref = db.collection("recipes").add(data)
        return jsonify({"id": doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes', methods=['GET'])
def get_user_recipes():
    """ Gets all recipes for a user. """
    try:
        # Get user ID from query param: /api/recipes?userId=abc
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({"error": "Missing 'userId' query parameter"}), 400
        
        recipes = []
        docs = db.collection('recipes').where('ownerId', '==', user_id).stream()
        for doc in docs:
            recipe_data = doc.to_dict()
            recipe_data['id'] = doc.id
            recipes.append(recipe_data)
        return jsonify(recipes), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<recipe_id>', methods=['PATCH'])
def update_recipe_route(recipe_id):
    """ Updates a single recipe document. """
    try:
        data = request.get_json()
        recipe_functions.update_recipe(recipe_id, data)
        return jsonify({"message": "Recipe updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<recipe_id>', methods=['DELETE'])
def delete_recipe_route(recipe_id):
    """ Deletes a single recipe document. """
    try:
        recipe_functions.delete_recipe(recipe_id)
        return ('', 204)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#######################################################
# Gemini Recipe Generation Routes
#######################################################

@app.route('/api/recipes/random', methods=['GET'])
def get_random_recipe_route():
    try:
        recipe_str = recipe_functions.get_random_recipe()
        # Convert the string to a dict and return as JSON
        recipe_data = ast.literal_eval(recipe_str)
        return jsonify(recipe_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/by-ingredients', methods=['POST'])
def get_ingredient_recipe_route():
    """
    EXPECTS: { "ingredients": ["item1", "item2"] }
    """
    try:
        data = request.get_json()
        ingredients = data.get('ingredients')
        if not ingredients or not isinstance(ingredients, list):
            return jsonify({"error": "Missing 'ingredients' list in request"}), 400
            
        recipe_str = recipe_functions.get_ingredient_recipe(ingredients)
        recipe_data = ast.literal_eval(recipe_str)
        return jsonify(recipe_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
#######################################################
# Web scrape for prices
#######################################################

@app.route("/api/prices", methods=["GET"])
def get_prices():
    item = request.args.get("grocery")
    if not item:
        return jsonify({"error": "Missing 'grocery' query parameter"}), 400

    results = {}
    try:
        results["walmart"] = get_walmart_prices(item)
        results["target"] = get_target_prices(item)
        results["kroger"] = get_kroger_prices(item)
    except Exception as e:
        # Fallback to mock data on error
        results = {
            "walmart": [{"name": "Mock Eggs", "price": "$3.49"}],
            "target": [{"name": "Mock Eggs", "price": "$4.29"}],
            "kroger": [{"name": "Mock Eggs", "price": "$4.99"}],
        }

    return jsonify({"grocery": item, "results": results})

# --- Main entry point ---
if __name__ == "__main__":
    app.run(debug=True, port=5000)