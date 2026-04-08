from flask import Blueprint, jsonify, request
from bson import ObjectId

admin = Blueprint('admin', __name__)
mongo = None


def init_admin(mongo_instance):
    global mongo
    mongo = mongo_instance


# ── GET ALL USERS ──────────────────────────────────────
@admin.route('/admin/users', methods=['GET'])
def get_all_users():
    users = list(mongo.db.users.find({}, {"password": 0}))
    for u in users:
        u["_id"] = str(u["_id"])
        u["order_count"] = mongo.db.orders.count_documents(
            {"user_id": u["_id"]}
        )
    return jsonify(users)


# ── GET ALL ORDERS WITH CUSTOMER INFO ─────────────────
@admin.route('/admin/orders', methods=['GET'])
def get_all_orders():
    orders = list(mongo.db.orders.find())
    for o in orders:
        o["_id"] = str(o["_id"])
        if "user_id" in o:
            try:
                user = mongo.db.users.find_one(
                    {"_id": ObjectId(o["user_id"])},
                    {"name": 1, "email": 1}
                )
                if user:
                    o["user_name"]  = user.get("name", "")
                    o["user_email"] = user.get("email", "")
            except Exception:
                pass
    return jsonify(orders)


# ── ADD PRODUCT ────────────────────────────────────────
@admin.route('/products', methods=['POST'])
def add_product():
    data = request.json
    result = mongo.db.products.insert_one(data)
    return jsonify({"_id": str(result.inserted_id), "message": "Product added"})


# ── UPDATE PRODUCT ─────────────────────────────────────
@admin.route('/products/<id>', methods=['PUT'])
def update_product(id):
    data = request.json
    mongo.db.products.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )
    return jsonify({"message": "Product updated"})


# ── DELETE PRODUCT ─────────────────────────────────────
@admin.route('/products/<id>', methods=['DELETE'])
def delete_product(id):
    mongo.db.products.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Product deleted"})