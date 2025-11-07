import google.generativeai as genai
from firebase_admin import firestore
from dotenv import load_dotenv
import os
import ast

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
