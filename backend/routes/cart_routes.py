from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.cart_service import CartService
from utils.response import success_response, error_response

cart = Blueprint("cart", __name__)

@cart.route("/cart", methods=["GET"])
@jwt_required()
def view_cart():
    user_id = get_jwt_identity()
    res = CartService.get_cart(user_id)
    return success_response(data=res)

@cart.route("/cart/add", methods=["POST"])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.json or {}
    product_id = data.get("product_id")
    quantity = int(data.get("quantity", 1))

    if not product_id:
        return error_response(code="VALIDATION_ERROR", message="product_id is required", status_code=400)

    res = CartService.add_to_cart(user_id, product_id, quantity)
    if "error" in res:
        return error_response(code=res["code"], message=res["error"], status_code=res["status"])
    return success_response(data=res, message="Item added to cart")

@cart.route("/cart/update", methods=["PUT"])
@jwt_required()
def update_cart():
    user_id = get_jwt_identity()
    data = request.json or {}
    product_id = data.get("product_id")
    quantity = data.get("quantity")

    if not product_id or quantity is None:
        return error_response(code="VALIDATION_ERROR", message="product_id and quantity are required", status_code=400)

    res = CartService.update_quantity(user_id, product_id, int(quantity))
    if "error" in res:
        return error_response(code=res["code"], message=res["error"], status_code=res["status"])
    return success_response(data=res, message="Cart updated")

@cart.route("/cart/remove", methods=["DELETE"])
@jwt_required()
def remove_from_cart():
    user_id = get_jwt_identity()
    data = request.json or {}
    product_id = data.get("product_id")

    if not product_id:
        return error_response(code="VALIDATION_ERROR", message="product_id is required", status_code=400)

    res = CartService.remove_from_cart(user_id, product_id)
    return success_response(data=res, message="Item removed from cart")

@cart.route("/cart/clear", methods=["DELETE"])
@jwt_required()
def clear_cart():
    user_id = get_jwt_identity()
    res = CartService.clear_cart(user_id)
    return success_response(data=res, message="Cart cleared")
