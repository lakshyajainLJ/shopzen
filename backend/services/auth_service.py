import bcrypt
from datetime import datetime
from bson import ObjectId
from flask_jwt_extended import create_access_token
from utils.db import get_db
from models.user_model import canonical_user
from utils.logger import logger

class AuthService:
    @staticmethod
    def register_user(name, email, password):
        try:
            db = get_db()
            email = email.strip().lower()
            
            if db.users.find_one({"email": email}):
                return {"error": "User with this email already exists", "code": "USER_EXISTS", "status": 409}
            
            hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            
            user_doc = {
                "name": name,
                "email": email,
                "password": hashed_pw,
                "role": "user",  # Security rule: default role is always 'user'
                "created_at": datetime.utcnow()
            }
            
            result = db.users.insert_one(user_doc)
            user_id = str(result.inserted_id)
            
            token = create_access_token(
                identity=user_id,
                additional_claims={"role": "user", "name": name, "email": email}
            )
            
            logger.info(f"New user registered: {email} (ID: {user_id})")
            return {
                "token": token,
                "user": {
                    "id": user_id,
                    "name": name,
                    "email": email,
                    "role": "user"
                }
            }
        except Exception as e:
            logger.error(f"Error in register_user: {str(e)}", exc_info=True)
            return {"error": f"Registration failed: {str(e)}", "code": "REGISTRATION_FAILED", "status": 500}

    @staticmethod
    def login_user(email, password):
        try:
            db = get_db()
            email = email.strip().lower()
            user = db.users.find_one({"email": email})
            
            if not user:
                logger.warning(f"Failed login attempt for non-existent email: {email}")
                return {"error": "Invalid email or password", "code": "INVALID_CREDENTIALS", "status": 401}
                
            stored_pw = user["password"]
            if isinstance(stored_pw, str):
                stored_pw = stored_pw.encode("utf-8")
                
            if not bcrypt.checkpw(password.encode("utf-8"), stored_pw):
                logger.warning(f"Failed login attempt for email: {email} (Invalid password)")
                return {"error": "Invalid email or password", "code": "INVALID_CREDENTIALS", "status": 401}
                
            user_id = str(user["_id"])
            role = user.get("role", "user")
            name = user.get("name", "")
            
            token = create_access_token(
                identity=user_id,
                additional_claims={"role": role, "name": name, "email": email}
            )
            
            logger.info(f"Successful login for email: {email} (Role: {role})")
            return {
                "token": token,
                "user": {
                    "id": user_id,
                    "name": name,
                    "email": email,
                    "role": role
                }
            }
        except Exception as e:
            logger.error(f"Error in login_user: {str(e)}", exc_info=True)
            return {"error": f"Login failed: {str(e)}", "code": "LOGIN_FAILED", "status": 500}

    @staticmethod
    def get_user_profile(user_id):
        db = get_db()
        try:
            user = db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                return {"error": "User not found", "code": "NOT_FOUND", "status": 404}
            return canonical_user(user)
        except Exception:
            return {"error": "Invalid user ID", "code": "INVALID_ID", "status": 400}
