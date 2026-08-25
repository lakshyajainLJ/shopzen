from flask import Blueprint, request
from middleware.auth import admin_required
from services.order_service import OrderService
from utils.db import get_db
from models.user_model import canonical_user
from utils.response import success_response, error_response

admin = Blueprint("admin", __name__)

@admin.route("/admin/users", methods=["GET"])
@admin_required()
def get_all_users():
    db = get_db()
    users_cursor = db.users.find({}, {"password": 0})
    users = []
    for u in users_cursor:
        c_user = canonical_user(u)
        c_user["order_count"] = db.orders.count_documents({"user_id": c_user["id"]})
        users.append(c_user)
    return success_response(data=users)

@admin.route("/admin/orders", methods=["GET"])
@admin_required()
def get_all_orders():
    orders = OrderService.get_all_orders()
    return success_response(data=orders)

@admin.route("/admin/orders/<id>", methods=["PUT"])
@admin_required()
def update_order_status(id):
    data = request.json or {}
    status = data.get("status")
    if not status:
        return error_response(code="VALIDATION_ERROR", message="Status is required", status_code=400)
    
    res = OrderService.update_order_status(id, status)
    if "error" in res:
        return error_response(code=res["code"], message=res["error"], status_code=res["status"])
    return success_response(data=res, message="Order status updated")