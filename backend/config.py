import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/shopzen")
    MONGODB_DATABASE = os.environ.get("MONGODB_DATABASE", "shopzen")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "prod_super_secret_jwt_key_shopzen_2026_x938")
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
    OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
