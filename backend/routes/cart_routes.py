from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId

cart = Blueprint("cart", __name__)


# =========================
# ADD PRODUCT TO CART
# =========================
@cart.route("/cart/add", methods=["POST"])
@jwt_required()
def add_to_cart():
    from app import mongo

    user_id = get_jwt_identity()
    data = request.json

    if not data or "product_id" not in data:
        return {"error": "product_id missing"}, 400

    product_id = ObjectId(data["product_id"])

    product = mongo.db.products.find_one({"_id": product_id})
    if not product:
        return {"error": "Product not found"}, 404

    existing_cart = mongo.db.carts.find_one({"user_id": user_id})

    if existing_cart:
        # Check if product already exists
        for item in existing_cart.get("items", []):
            if str(item["product_id"]) == str(product_id):
                mongo.db.carts.update_one(
                    {"user_id": user_id, "items.product_id": product_id},
                    {"$inc": {"items.$.quantity": 1}}
                )
                break
        else:
            mongo.db.carts.update_one(
                {"user_id": user_id},
                {
                    "$push": {
                        "items": {
                            "product_id": product_id,
                            "title": product.get("title"),
                            "price": product.get("price"),
                            "quantity": 1,
                            "image": product.get("image")
                        }
                    }
                }
            )
    else:
        mongo.db.carts.insert_one({
            "user_id": user_id,
            "items": [
                {
                    "product_id": product_id,
                    "title": product.get("title"),
                    "price": product.get("price"),
                    "quantity": 1,
                    "image": product.get("image")
                }
            ]
        })

    return {"message": "Product added to cart"}, 200


# =========================
# VIEW CART
# =========================
@cart.route("/cart", methods=["GET"])
@jwt_required()
def view_cart():
    from app import mongo

    user_id = get_jwt_identity()
    cart_data = mongo.db.carts.find_one({"user_id": user_id})

    if not cart_data:
        return {"items": [], "total_price": 0}, 200

    items = []
    total_price = 0

    for item in cart_data.get("items", []):
        subtotal = item["price"] * item["quantity"]
        total_price += subtotal

        items.append({
            "product_id": str(item["product_id"]),
            "title": item["title"],
            "price": item["price"],
            "quantity": item["quantity"],
            "image": item.get("image"),
            "subtotal": subtotal
        })

    return {
        "items": items,
        "total_price": total_price
    }, 200


# =========================
# UPDATE QUANTITY
# =========================
@cart.route("/cart/update", methods=["PUT"])
@jwt_required()
def update_cart_quantity():
    from app import mongo

    user_id = get_jwt_identity()
    data = request.json

    if not data or "product_id" not in data or "quantity" not in data:
        return {"error": "Invalid data"}, 400

    product_id = ObjectId(data["product_id"])
    quantity = data["quantity"]

    if quantity < 1:
        return {"error": "Quantity must be at least 1"}, 400

    mongo.db.carts.update_one(
        {"user_id": user_id, "items.product_id": product_id},
        {"$set": {"items.$.quantity": quantity}}
    )

    return {"message": "Quantity updated"}, 200


# =========================
# REMOVE ITEM
# =========================
@cart.route("/cart/remove", methods=["DELETE"])
@jwt_required()
def remove_from_cart():
    from app import mongo

    user_id = get_jwt_identity()
    data = request.json

    if not data or "product_id" not in data:
        return {"error": "product_id missing"}, 400

    product_id = ObjectId(data["product_id"])

    mongo.db.carts.update_one(
        {"user_id": user_id},
        {"$pull": {"items": {"product_id": product_id}}}
    )

    return {"message": "Item removed"}, 200


# =========================
# CLEAR CART
# =========================
@cart.route("/cart/clear", methods=["DELETE"])
@jwt_required()
def clear_cart():
    from app import mongo

    user_id = get_jwt_identity()

    mongo.db.carts.delete_one({"user_id": user_id})

    return {"message": "Cart cleared"}, 200
