from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

order = Blueprint("order", __name__)


# =========================
# PLACE ORDER
# =========================
@order.route("/orders/place", methods=["POST"])
@jwt_required()
def place_order():
    from app import mongo

    user_id = get_jwt_identity()

    # FIXED HERE
    cart = mongo.db.carts.find_one({"user_id": user_id})

    if not cart or not cart.get("items"):
        return {"error": "Cart is empty"}, 400

    total_amount = sum(
        item["price"] * item["quantity"] for item in cart["items"]
    )

    order_data = {
        "user_id": user_id,
        "items": cart["items"],
        "total_amount": total_amount,
        "status": "PLACED",
        "created_at": datetime.utcnow()
    }

    mongo.db.orders.insert_one(order_data)

    # FIXED HERE
    mongo.db.carts.delete_one({"user_id": user_id})

    return {
        "message": "Order placed successfully",
        "total_amount": total_amount
    }
# =========================
# VIEW USER ORDERS
# =========================
@order.route("/orders", methods=["GET"])
@jwt_required()
def get_my_orders():
    from app import mongo

    user_id = get_jwt_identity()

    orders = list(
        mongo.db.orders.find({"user_id": user_id})
        .sort("created_at", -1)
    )

    for order_item in orders:
        order_item["_id"] = str(order_item["_id"])

    return orders
