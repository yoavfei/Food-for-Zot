import google.generativeai as genai
from firebase_admin import firestore
from dotenv import load_dotenv
import os
import ast
import re

from firebase_setup import db

load_dotenv()
GEMINI_API_KEY = os.getenv('API_KEY')

########### GET FROM GEMINI ############

def get_random_recipe():
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    recipe = model.generate_content('Give me a recipe in the format: {name: name of recipe, ingredients: {name, amount}, {name, amount}, instructions: string of instructions}. Do not include "```json```"')

    return recipe.text

def get_ingredient_recipe(ingredients_list: list):
    ingredient_str = ", ".join(ingredients_list) 

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    recipe = model.generate_content(f'Give me a recipe that includes {ingredient_str}...')
    return recipe.text

def get_specific_recipe(food):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    recipe = model.generate_content(f'Give me a recipe of {food} in the format: {{name: {food}, ingredients: {{name, amount}}, {{name, amount}}, instructions: string of instructions}}". Do not include "```json```"')

    return recipe.text

def filter_and_rank_products(query: str, results_list: list):
    """
    Uses Gemini to FILTER and rank a list of product results based on a query.
    """
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')

    product_names = [r.get('productName') for r in results_list if r.get('productName')]
    if not product_names:
        return results_list # No names to rank

    # 1. This is the new, stricter prompt.
    prompt = (
        f"You are a smart grocery shopping assistant. A user searched for the item: '{query}'.\n"
        f"Here is a Python list of product names: {product_names}\n\n"
        "Follow these 2 steps:\n"
        "Step 1: **Filter** this list to *only* include items that are a *direct match* or *very close substitute* for the query. You MUST REMOVE items that are clearly different, even if they share a word.\n"
        "For example, if the query is 'milk', you MUST REMOVE 'Milk Chocolate', 'Yogurt', and 'Buttermilk Ranch Dressing'.\n"
        "You SHOULD KEEP 'Organic Whole Milk', '2% Milk', 'Chocolate Milk', and 'Coconut Milk'.\n"
        "Step 2: **Sort** the small, *filtered* list from most relevant to least relevant.\n"
        "Finally, return *only* the filtered and sorted Python list. If no items are relevant, return an empty list []."
    )

    response = model.generate_content(prompt)
    gemini_response_text = response.text.strip()
    
    print("--- Gemini AI Filter/Rank Response ---")
    print(gemini_response_text)
    
    sorted_names_list = []
    
    try:
        match = re.search(r'\[.*\]', gemini_response_text, re.DOTALL)
        if match:
            sorted_names_str = match.group(0)
            sorted_names_list = ast.literal_eval(sorted_names_str)
        else:
            sorted_names_list = ast.literal_eval(gemini_response_text)

    except Exception as e:
        print(f"!!! FAILED TO PARSE GEMINI RESPONSE: {e}")
        # If Gemini fails, just return the original list
        return results_list 

    sort_order = {name: index for index, name in enumerate(sorted_names_list)}

    sorted_results = sorted(
        results_list,
        key=lambda r: sort_order.get(r.get('productName'), 999)
    )

    final_filtered_list = [r for r in sorted_results if r.get('productName') in sort_order]

    return final_filtered_list

########## ADD FUNCTIONS ##############

def add_recipe(user_id: str, recipe_str: str):
    recipe_data = ast.literal_eval(recipe_str)
    recipe_data['ownerId'] = user_id
    recipe_data['createdAt'] = firestore.SERVER_TIMESTAMP
    doc_ref = db.collection('recipes').add(recipe_data)
    return doc_ref[1].id
    
######### EDITING FUNCTIONS ############    

def update_recipe(recipe_id: str, new_data: dict):
    doc_ref = db.collection('recipes').document(recipe_id)
    doc_ref.update(new_data)

######## DELETING FUNCTIONS ############
def delete_recipe(recipe_id: str):
    doc_ref = db.collection('recipes').document(recipe_id)
    doc_ref.delete()


if __name__ == "__main__":
    # recipe = get_random_recipe()
    # print(recipe)
    # add_recipe('new_user', recipe)

    # edit_recipe_name('new_user', 'Classic Guacamole', 'Guac')
    # edit_recipe_ingredient_name('new_user', 'Guac', 'Avocados', 'avos')
    # print(get_recipe())

    # add_ingredient('new_user', 'Classic Guacamole', 'peanut butter', '1 tsp')
    # add_instructions('new_user', 'Classic Guacamole', 'taste test with a chip')
    pass
