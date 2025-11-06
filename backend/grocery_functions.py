import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate("food-for-zot-firebase-adminsdk-fbsvc-f018325808.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


class Food():
    pass

def get_food():
    pass

def add_food():
    pass

def edit_food():
    pass

def add_interval():
    pass


if __name__ == "__main__":
    pass

