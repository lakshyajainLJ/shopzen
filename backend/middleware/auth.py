from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from bson import ObjectId
from utils.db import get_db
from utils.response import error_response
from utils.logger import logger

def admin_required():
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception as e:
                return error_response(code="UNAUTHORIZED", message="Authentication required", status_code=401)
            
            jwt_claims = get_jwt()
            user_id = get_jwt_identity()
            
            # Check DB to ensure user exists and role is admin
            db = get_db()
            try:
                user = db.users.find_one({"_id": ObjectId(user_id)})
            except Exception:
                user = None

            if not user:
                logger.warning(f"Admin request failed: user {user_id} not found in DB")
                return error_response(code="USER_NOT_FOUND", message="User not found", status_code=401)
            
            if user.get("role") != "admin":
                logger.warning(f"Forbidden admin access attempt by user {user_id} with role '{user.get('role')}'")
                return error_response(code="FORBIDDEN", message="Admin access required", status_code=403)
                
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def user_required():
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception as e:
                return error_response(code="UNAUTHORIZED", message="Authentication required", status_code=401)
            return fn(*args, **kwargs)
        return wrapper
    return decorator
