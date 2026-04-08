from flask import Blueprint, request
from bson import ObjectId

product = Blueprint("product", __name__)


# =========================
# ADD PRODUCT (Admin use)
# =========================
@product.route("/products/add", methods=["POST"])
def add_product():
    from app import mongo

    data = request.json

    if not data.get("name") or not data.get("price"):
        return {"error": "Name and price required"}, 400

    new_product = {
        "name": data["name"],
        "price": data["price"],
        "image": data.get("image", ""),
        "description": data.get("description", "")
    }

    result = mongo.db.products.insert_one(new_product)

    return {
        "message": "Product added successfully",
        "product_id": str(result.inserted_id)
    }, 201


# =========================
# GET ALL PRODUCTS
# =========================
@product.route("/products", methods=["GET"])
def get_products():
    from app import mongo
    from flask import request

    search = request.args.get("search")

    query = {}

    if search:
        query = {
            "name": {"$regex": search, "$options": "i"}
        }

    products = []

    for item in mongo.db.products.find(query):
        products.append({
            "_id": str(item["_id"]),
            "name": item.get("name"),
            "price": item.get("price"),
            "image": item.get("image", ""),
            "description": item.get("description", "")
        })

    return products


# =========================
# GET SINGLE PRODUCT
# =========================
@product.route("/products/<id>", methods=["GET"])
def get_product(id):
    from app import mongo

    try:
        product = mongo.db.products.find_one({"_id": ObjectId(id)})

        if not product:
            return {"error": "Product not found"}, 404

        return {
            "_id": str(product["_id"]),
            "name": product.get("name") or product.get("title"),
            "price": product.get("price"),
            "image": product.get("image", ""),
            "description": product.get("description", "")
        }, 200

    except:
        return {"error": "Invalid product id"}, 400