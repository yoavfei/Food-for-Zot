from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("API_KEY")

client = genai.Client()

def get_recipe():
    recipe = client.models.generate_content(
        model="gemini-2.5-flash", contents="Give me a recipe."
    )

    pass



if __name__ == "__main__":
    pass