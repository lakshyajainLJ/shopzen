from datetime import datetime
from bson import ObjectId
from utils.db import get_db
from models.product_model import canonical_product
from utils.logger import logger

class ProductService:
    @staticmethod
    def get_products(page=1, limit=20, category=None, search=None):
        db = get_db()
        query = {}
        
        if category and category.lower() != "all":
            query["category"] = {"$regex": f"^{category}$", "$options": "i"}
            
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}}
            ]
            
        total_count = db.products.count_documents(query)
        
        skip = (page - 1) * limit
        cursor = db.products.find(query).skip(skip).limit(limit)
        
        products = [canonical_product(p) for p in cursor]
        
        return {
            "products": products,
            "page": page,
            "limit": limit,
            "total": total_count,
            "pages": (total_count + limit - 1) // limit if limit > 0 else 1
        }

    @staticmethod
    def get_product_by_id(product_id):
        db = get_db()
        try:
            p = db.products.find_one({"_id": ObjectId(product_id)})
            if not p:
                return {"error": "Product not found", "code": "NOT_FOUND", "status": 404}
            return canonical_product(p)
        except Exception:
            return {"error": "Invalid product ID", "code": "INVALID_ID", "status": 400}

    @staticmethod
    def create_product(data):
        db = get_db()
        name = data.get("name") or data.get("title")
        price = data.get("price")
        
        if not name or price is None:
            return {"error": "Name and price are required", "code": "VALIDATION_ERROR", "status": 400}
            
        doc = {
            "name": name,
            "title": name, # for backward compatibility
            "price": float(price),
            "description": data.get("description", ""),
            "category": data.get("category", "General"),
            "image": data.get("image", ""),
            "stock": int(data.get("stock", 100)),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        res = db.products.insert_one(doc)
        doc["_id"] = res.inserted_id
        logger.info(f"Product created: {name} (ID: {res.inserted_id})")
        return canonical_product(doc)

    @staticmethod
    def update_product(product_id, data):
        db = get_db()
        try:
            existing = db.products.find_one({"_id": ObjectId(product_id)})
            if not existing:
                return {"error": "Product not found", "code": "NOT_FOUND", "status": 404}
                
            update_fields = {}
            if "name" in data or "title" in data:
                val = data.get("name") or data.get("title")
                update_fields["name"] = val
                update_fields["title"] = val
            if "price" in data:
                update_fields["price"] = float(data["price"])
            if "description" in data:
                update_fields["description"] = data["description"]
            if "category" in data:
                update_fields["category"] = data["category"]
            if "image" in data:
                update_fields["image"] = data["image"]
            if "stock" in data:
                update_fields["stock"] = int(data["stock"])
                
            update_fields["updated_at"] = datetime.utcnow()
            
            db.products.update_one({"_id": ObjectId(product_id)}, {"$set": update_fields})
            updated = db.products.find_one({"_id": ObjectId(product_id)})
            logger.info(f"Product updated: {product_id}")
            return canonical_product(updated)
        except Exception as e:
            return {"error": f"Failed to update product: {str(e)}", "code": "UPDATE_FAILED", "status": 400}

    @staticmethod
    def delete_product(product_id):
        db = get_db()
        try:
            res = db.products.delete_one({"_id": ObjectId(product_id)})
            if res.deleted_count == 0:
                return {"error": "Product not found", "code": "NOT_FOUND", "status": 404}
            logger.info(f"Product deleted: {product_id}")
            return {"message": "Product deleted successfully"}
        except Exception:
            return {"error": "Invalid product ID", "code": "INVALID_ID", "status": 400}
