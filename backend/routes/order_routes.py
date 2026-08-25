from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.order_service import OrderService
from utils.response import success_response, error_response

order = Blueprint("order", __name__)

@order.route("/orders/place", methods=["POST"])
@jwt_required()
def place_order():
    user_id = get_jwt_identity()
    data = request.json or {}
    
    res = OrderService.place_order(user_id, data)
    if "error" in res:
        return error_response(code=res["code"], message=res["error"], status_code=res["status"])
    return success_response(data=res, message="Order placed successfully", status_code=201)

@order.route("/orders", methods=["GET"])
@jwt_required()
def get_orders():
    user_id = get_jwt_identity()
    orders = OrderService.get_user_orders(user_id)
    return success_response(data=orders)
