from flask import Blueprint, request
from flask_jwt_extended import create_access_token
import bcrypt
from bson import ObjectId


auth = Blueprint("auth", __name__)

@auth.route("/register", methods=["POST"])
def register():
    from app import mongo

    data = request.json

    # Check if user already exists
    if mongo.db.users.find_one({"email": data["email"]}):
        return {"error": "User already exists"}, 400

    # Hash password
    hashed_pw = bcrypt.hashpw(
        data["password"].encode("utf-8"),
        bcrypt.gensalt()
    )

    # Insert user into DB
    mongo.db.users.insert_one({
    "name": data["name"],
    "email": data["email"],
    "password": hashed_pw,
    "role": data.get("role", "user")   # ← add this line
})

    return {"message": "User registered successfully"}


@auth.route("/login", methods=["POST"])
def login():
    from app import mongo
    data = request.json

    user = mongo.db.users.find_one({"email": data["email"]})

    if not user:
        return {"error": "Invalid email or password"}, 401

    # Check password
    if not bcrypt.checkpw(
        data["password"].encode("utf-8"),
        user["password"]
    ):
        return {"error": "Invalid email or password"}, 401

    # Create JWT token
    access_token = create_access_token(
    identity=
    str(user["_id"]),
    additional_claims={"role": user.get("role", "user")}
)

    return {
        "message": "Login successful",
        "token": access_token
    }

from flask_jwt_extended import jwt_required, get_jwt_identity

@auth.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    from app import mongo

    user_id = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return {"error": "User not found"}, 404

    return {
        "name": user["name"],
        "email": user["email"]
    }
