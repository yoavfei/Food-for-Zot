import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
GEMINI_API_KEY = os.getenv("API_KEY")

# client = genai.Client()

def get_recipe():
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
    recipe = model.generate_content("Give me a recipe in the format: {ingredients: {list of ingredients}, quantities: {respective list of quantities}, instructions: {string of instructions}}"
    )

    return recipe.text

def itemize_recipe():
    pass


if __name__ == "__main__":
    # print(get_recipe())

