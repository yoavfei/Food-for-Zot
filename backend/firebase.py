import firebase_admin
from firebase_admin import firestore, credentials
import json

with open('./firebase.json', 'r') as f:
    FIREBASE_JSON = json.load(f)

cred = credentials.Certificate(FIREBASE_JSON)
firebase_admin.initialize_app(cred)
db = firestore.client()
