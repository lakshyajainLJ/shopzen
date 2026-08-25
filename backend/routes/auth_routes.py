from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.auth_service import AuthService
from utils.response import success_response, error_response

auth = Blueprint("auth", __name__)

@auth.route("/register", methods=["POST"])
def register():
    data = request.json or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not name or not email or not password:
        return error_response(code="VALIDATION_ERROR", message="Name, email, and password are required", status_code=400)

    res = AuthService.register_user(name, email, password)
    if "error" in res:
        return error_response(code=res["code"], message=res["error"], status_code=res["status"])

    return success_response(data=res, message="User registered successfully", status_code=201)

@auth.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return error_response(code="VALIDATION_ERROR", message="Email and password are required", status_code=400)

    res = AuthService.login_user(email, password)
    if "error" in res:
        return error_response(code=res["code"], message=res["error"], status_code=res["status"])

    return success_response(data=res, message="Login successful")

@auth.route("/profile", methods=["GET"])
@auth.route("/me", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = AuthService.get_user_profile(user_id)
    if "error" in user:
        return error_response(code=user["code"], message=user["error"], status_code=user["status"])

    return success_response(data=user)
