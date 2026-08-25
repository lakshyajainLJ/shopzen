from bson import ObjectId
from utils.db import get_db
from models.product_model import canonical_product

class RecommendationService:
    @staticmethod
    def get_recommendations(user_id=None, limit=6):
        db = get_db()
        preferred_categories = set()
        
        if user_id:
            # 1. Inspect user purchase history
            orders = db.orders.find({"user_id": str(user_id)}).limit(5)
            for order in orders:
                for item in order.get("items", []):
                    p_id = item.get("product_id")
                    try:
                        p = db.products.find_one({"_id": ObjectId(p_id)})
                        if p and p.get("category"):
                            preferred_categories.add(p["category"])
                    except Exception:
                        pass
                        
            # 2. Inspect user wishlist
            wishlist = db.wishlists.find_one({"user_id": str(user_id)})
            if wishlist and wishlist.get("product_ids"):
                for p_id in wishlist.get("product_ids", []):
                    try:
                        p = db.products.find_one({"_id": ObjectId(p_id)})
                        if p and p.get("category"):
                            preferred_categories.add(p["category"])
                    except Exception:
                        pass
                        
        query = {}
        if preferred_categories:
            query["category"] = {"$in": list(preferred_categories)}
            
        products_cursor = list(db.products.find(query).limit(limit))
        
        # If not enough products matched preferred categories, fill with general products
        if len(products_cursor) < limit:
            existing_ids = [p["_id"] for p in products_cursor]
            fallback_cursor = db.products.find({"_id": {"$nin": existing_ids}}).limit(limit - len(products_cursor))
            products_cursor.extend(list(fallback_cursor))
            
        return [canonical_product(p) for p in products_cursor]
