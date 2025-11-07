from firebase_admin import firestore
from flask import Flask, jsonify, request
from flask_cors import CORS
import ast
from google.api_core import exceptions
from datetime import datetime # Import datetime to handle the conversion

from scraper.scrapers import get_food_prices
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
    try:
        data = request.get_json()
        uid = data.get('uid')
        if not uid:
            return jsonify({"error": "Missing 'uid' in request"}), 400
        
        doc_ref = db.collection("users").document(uid)
        
        new_user_data = {
            'email': data.get('email'),
            'name': '',
            'preferences': {'dark_mode': False},
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        
        doc_ref.set(new_user_data)
        return jsonify({"id": uid}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        doc = db.collection('users').document(user_id).get()
        if not doc.exists:
            return jsonify({'error': 'User not found'}), 404
            
        user_data = doc.to_dict()
        
        if 'createdAt' in user_data and isinstance(user_data['createdAt'], datetime):
            user_data['createdAt'] = user_data['createdAt'].isoformat()
            
        return jsonify(user_data)
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

######################################################
# CRUD for Lists
######################################################

@app.route('/api/lists', methods=['POST'])
def create_list():
    try:
        data = request.get_json()
        data['createdAt'] = firestore.SERVER_TIMESTAMP
        
        doc_ref = db.collection("lists").add(data)
        new_list = doc_ref[1].get().to_dict()
        new_list['id'] = doc_ref[1].id
        if 'createdAt' in new_list and isinstance(new_list['createdAt'], datetime):
            new_list['createdAt'] = new_list['createdAt'].isoformat()
            
        return jsonify(new_list), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists', methods=['GET'])
def get_user_lists():
    try:
        user_id = request.args.get('userId') 
        if not user_id:
            return jsonify({"error": "Missing 'userId' query parameter"}), 400

        lists = []
        
        docs = db.collection('lists') \
                 .where('ownerId', '==', user_id) \
                 .order_by("createdAt", direction=firestore.Query.DESCENDING) \
                 .stream()

        for doc in docs:
            list_data = doc.to_dict()
            list_data['id'] = doc.id
            if 'createdAt' in list_data and isinstance(list_data['createdAt'], datetime):
                list_data['createdAt'] = list_data['createdAt'].isoformat()
            
            lists.append(list_data)
        return jsonify(lists), 200
    
    except exceptions.FailedPrecondition as e:
        print(f"!!! MISSING INDEX: {e.message}")
        return jsonify({"error": "Database index error. Check backend console."}), 500
    except Exception as e:
        print(f"An error occurred in get_user_lists: {repr(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<list_id>', methods=['DELETE'])
def delete_list(list_id):
    try:
        db.collection("lists").document(list_id).delete()
        return ('', 204)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

######################################################
# CRUD for List Items
######################################################

@app.route('/api/lists/<list_id>/items', methods=['POST'])
def create_list_item(list_id):
    try:
        data = request.get_json()
        data['createdAt'] = firestore.SERVER_TIMESTAMP
        
        doc_ref = db.collection("lists").document(list_id).collection("items").add(data)
        new_item = doc_ref[1].get().to_dict()
        new_item['id'] = doc_ref[1].id
        if 'createdAt' in new_item and isinstance(new_item['createdAt'], datetime):
            new_item['createdAt'] = new_item['createdAt'].isoformat()
            
        return jsonify(new_item), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<list_id>/items', methods=['GET'])
def get_list_items(list_id):
    try:
        items = []
        docs = db.collection("lists") \
                 .document(list_id) \
                 .collection("items") \
                 .order_by("createdAt", direction=firestore.Query.DESCENDING) \
                 .stream()
        
        for doc in docs:
            item_data = doc.to_dict()
            item_data['id'] = doc.id
            if 'createdAt' in item_data and isinstance(item_data['createdAt'], datetime):
                item_data['createdAt'] = item_data['createdAt'].isoformat()
            
            items.append(item_data)
        return jsonify(items), 200
    
    except exceptions.FailedPrecondition as e:
        print(f"!!! MISSING INDEX: {e.message}")
        return jsonify({"error": "Database index error. Check backend console."}), 500
    except Exception as e:
        print(f"An error occurred in get_list_items: {repr(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<list_id>/items/<item_id>', methods=['PATCH'])
def update_list_item(list_id, item_id):
    try:
        data = request.get_json()
        doc_ref = db.collection("lists").document(list_id).collection("items").document(item_id)
        doc_ref.update(data)
        return jsonify({"message": "Item updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lists/<list_id>/items/<item_id>', methods=['DELETE'])
def delete_list_item(list_id, item_id):
    try:
        doc_ref = db.collection("lists").document(list_id).collection("items").document(item_id)
        doc_ref.delete()
        return ('', 204)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

####################################################### 
# CRUD for Recipes
#######################################################

@app.route('/api/recipes', methods=['POST'])
def create_recipe():
    try:
        data = request.get_json()
        data['createdAt'] = firestore.SERVER_TIMESTAMP
        
        doc_ref = db.collection("recipes").add(data)

        # --- FIX ---
        new_recipe = doc_ref[1].get().to_dict()
        new_recipe['id'] = doc_ref[1].id
        if 'createdAt' in new_recipe and isinstance(new_recipe['createdAt'], datetime):
            new_recipe['createdAt'] = new_recipe['createdAt'].isoformat()

        return jsonify(new_recipe), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes', methods=['GET'])
def get_user_recipes():
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({"error": "Missing 'userId' query parameter"}), 400
        
        recipes = []
        docs = db.collection('recipes') \
                 .where('ownerId', '==', user_id) \
                 .order_by("createdAt", direction=firestore.Query.DESCENDING) \
                 .stream()
                 
        for doc in docs:
            recipe_data = doc.to_dict()
            recipe_data['id'] = doc.id
            if 'createdAt' in recipe_data and isinstance(recipe_data['createdAt'], datetime):
                recipe_data['createdAt'] = recipe_data['createdAt'].isoformat()
            
            recipes.append(recipe_data)
        return jsonify(recipes), 200
        
    except exceptions.FailedPrecondition as e:
        print(f"!!! MISSING INDEX (Recipes): {e.message}")
        return jsonify({"error": "Database index error. Check backend console."}), 500
    except Exception as e:
        print(f"An error occurred in get_user_recipes: {repr(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    try:
        doc = db.collection('recipes').document(recipe_id).get()
        if not doc.exists:
            return jsonify({'error': 'Recipe not found'}), 404
            
        recipe_data = doc.to_dict()
        recipe_data['id'] = doc.id
        if 'createdAt' in recipe_data and isinstance(recipe_data['createdAt'], datetime):
            recipe_data['createdAt'] = recipe_data['createdAt'].isoformat()
            
        return jsonify(recipe_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<recipe_id>', methods=['PATCH'])
def update_recipe_route(recipe_id):
    try:
        data = request.get_json()
        recipe_functions.update_recipe(recipe_id, data)
        return jsonify({"message": "Recipe updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<recipe_id>', methods=['DELETE'])
def delete_recipe_route(recipe_id):
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
# AI-Powered Price Ranking
#######################################################

@app.route("/api/prices/rank", methods=["POST"])
def rank_prices():
    """
    Takes a search query and a list of product results,
    and returns the list FILTERED and SORTED by relevance using Gemini.
    """
    try:
        data = request.get_json()
        query = data.get('query')
        results = data.get('results')

        if not query or not results:
            return jsonify({"error": "Missing 'query' or 'results' in request"}), 400

        # --- THIS IS THE FIX ---
        # Call the new function
        sorted_list = recipe_functions.filter_and_rank_products(query, results)
        
        return jsonify(sorted_list), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred while ranking: {str(e)}"}), 500
        
#######################################################
# Web scrape for prices
#######################################################

@app.route("/api/prices", methods=["GET"])
def get_prices():
    item = request.args.get("grocery")
    if not item:
        return jsonify({"error": "Missing 'grocery' query parameter"}), 400

    try:
        results = get_food_prices(item) 
        
        return jsonify({"grocery": item, "results": results})

    except Exception as e:
        return jsonify({
            "error": f"An error occurred while fetching prices: {str(e)}",
            "grocery": item,
            "results": {}
        }), 500

# --- Main entry point ---
if __name__ == "__main__":
    app.run(debug=True, port=5000)