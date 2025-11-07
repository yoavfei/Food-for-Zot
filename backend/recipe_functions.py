import google.generativeai as genai
from firebase_admin import firestore
from dotenv import load_dotenv
import os
import firebase
import ast

load_dotenv()
GEMINI_API_KEY = os.getenv('API_KEY')

########### GET FROM GEMINI ############

def get_random_recipe():
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    recipe = model.generate_content('Give me a recipe in the format: {name: name of recipe, ingredients: {name, amount}, {name, amount}, instructions: string of instructions}. Do not include "```json```"')

    return recipe.text

def get_ingredient_recipe(ingredient):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    recipe = model.generate_content(f'Give me a recipe that includes {ingredient} in the format: {{name: name of recipe, ingredients: {{name, amount}}, {{name, amount}}, instructions: string of instructions}}". Do not include "```json```"')

    return recipe.text

def get_specific_recipe(food):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    recipe = model.generate_content(f'Give me a recipe of {food} in the format: {{name: {food}, ingredients: {{name, amount}}, {{name, amount}}, instructions: string of instructions}}". Do not include "```json```"')

    return recipe.text

########## ADD FUNCTIONS ##############

def add_recipe(user: str, recipe: str):
    recipe = ast.literal_eval(recipe)

    doc_ref = firebase.db.collection('recipes').document(user)

    name = recipe['name']
    ingredients = recipe['ingredients']
    instructions = recipe['instructions']

    doc_ref.update({name: 
                {'ingredients': ingredients, 
                'instructions': instructions}})
    
def add_ingredient(user: str, recipe: str, name: str, amount: str):
    doc_ref = firebase.db.collection('recipes').document(user)

    new_ingredient = {'ingredients': {'name': name, 'amount': amount}}
    doc_ref.update({f'{recipe}.ingredients': firestore.ArrayUnion([new_ingredient])})

# def add_instructions(user: str, recipe: str, instructions: str):
#     doc_ref = firebase.db.collection('recipes').document(user)

#     doc_ref.update({f'{recipe}.instructions': instructions})
    
######### EDITING FUNCTIONS ############    

def edit_recipe_name(user: str, recipe: str, new_name: str):
    doc_ref = firebase.db.collection('recipes').document(user)
    data = doc_ref.get().to_dict()
    recipe_info = data.get(recipe)

    doc_ref.update({new_name: recipe_info,
                    recipe: firestore.DELETE_FIELD})

def edit_recipe_ingredient_name(user: str, recipe: str, old_ingredient: str, new_ingredient: str):
    pass

def edit_recipe_ingredient_amount(user: str, recipe: str, new_amount: str):
    pass

def edit_recipe_instructions(user: str, recipe: str, instructions: str):
    doc_ref = firebase.db.collection('recipes').document(user)

    doc_ref.update({f'{recipe}.instructions': instructions})

######## DELETING FUNCTIONS ############
def delete_recipe(user: str, recipe: str):
    doc_ref = firebase.db.collection('recipes').document(user)
    doc_ref.update({recipe: firestore.DELETE_FIELD})

def delete_ingredient(user: str, recipe: str, name: str, amount: str):
    doc_ref = firebase.db.collection('recipes').document(user)

    doc_ref.update({f'{recipe}.ingredients': 
                    firestore.ArrayRemove([{'name': name, 'amount': amount}])})


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
