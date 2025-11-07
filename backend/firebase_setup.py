import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from dotenv import load_dotenv

load_dotenv()

service_account_str = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')

if not service_account_str:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT_JSON is not set in your .env file!")

service_account_dict = json.loads(service_account_str)

cred = credentials.Certificate(service_account_dict)
firebase_admin.initialize_app(cred)

db = firestore.client()