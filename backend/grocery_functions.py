import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("path/to/serviceAccountKey.json")
app = firebase_admin.initialize_app(cred)
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
    user_ref = db.collection('users').document('yoav')
    doc = user_ref.get()
    if doc.exists:
        print(f"Document data: {doc.to_dict()}")
    else:
        print("No such document!")

