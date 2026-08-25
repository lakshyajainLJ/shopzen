from flask import Blueprint, request
from services.product_service import ProductService
from middleware.auth import admin_required
from utils.response import success_response, error_response

product = Blueprint("product", __name__)

@product.route("/products", methods=["GET"])
def get_products():
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 50, type=int)
    category = request.args.get("category")
    search = request.args.get("search")

    res = ProductService.get_products(page=page, limit=limit, category=category, search=search)
    return success_response(data=res)

@product.route("/products/<id>", methods=["GET"])
def get_product(id):
    res = ProductService.get_product_by_id(id)
    if "error" in res:
        return error_response(code=res["code"], message=res["error"], status_code=res["status"])
    return success_response(data=res)

@product.route("/products", methods=["POST"])
@product.route("/products/add", methods=["POST"])
@admin_required()
def add_product():
    data = request.json or {}
    res = ProductService.create_product(data)
    if "error" in res:
        return error_response(code=res["code"], message=res["error"], status_code=res["status"])
    return success_response(data=res, message="Product created successfully", status_code=201)

@product.route("/products/<id>", methods=["PUT"])
@admin_required()
def update_product(id):
    data = request.json or {}
    res = ProductService.update_product(id, data)
    if "error" in res:
        return error_response(code=res["code"], message=res["error"], status_code=res["status"])
    return success_response(data=res, message="Product updated successfully")

@product.route("/products/<id>", methods=["DELETE"])
@admin_required()
def delete_product(id):
    res = ProductService.delete_product(id)
    if "error" in res:
        return error_response(code=res["code"], message=res["error"], status_code=res["status"])
    return success_response(data=res, message="Product deleted successfully")