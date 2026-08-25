from bson import ObjectId
from utils.db import get_db
from utils.logger import logger

class CartService:
    @staticmethod
    def get_cart(user_id):
        db = get_db()
        cart = db.carts.find_one({"user_id": str(user_id)})
        
        if not cart or not cart.get("items"):
            return {"items": [], "total_price": 0, "subtotal": 0}
            
        items = []
        total_price = 0
        
        for item in cart.get("items", []):
            p_id = item.get("product_id")
            # Fetch live product details to ensure updated price and stock check
            product = None
            try:
                product = db.products.find_one({"_id": ObjectId(p_id)})
            except Exception:
                pass
                
            if not product:
                continue
                
            live_price = float(product.get("price", item.get("price", 0)))
            live_name = product.get("name") or product.get("title") or item.get("title") or item.get("name")
            live_image = product.get("image", item.get("image", ""))
            stock = int(product.get("stock", 100))
            quantity = int(item.get("quantity", 1))
            
            # Enforce stock boundary
            if quantity > stock:
                quantity = max(1, stock)
                
            subtotal = live_price * quantity
            total_price += subtotal
            
            items.append({
                "product_id": str(p_id),
                "title": live_name,
                "name": live_name,
                "price": live_price,
                "quantity": quantity,
                "image": live_image,
                "stock": stock,
                "subtotal": subtotal
            })
            
        return {
            "items": items,
            "subtotal": total_price,
            "total_price": total_price
        }

    @staticmethod
    def add_to_cart(user_id, product_id, quantity=1):
        db = get_db()
        if quantity < 1:
            return {"error": "Quantity must be at least 1", "code": "INVALID_QUANTITY", "status": 400}
            
        try:
            p_obj_id = ObjectId(product_id)
        except Exception:
            return {"error": "Invalid product ID", "code": "INVALID_ID", "status": 400}
            
        product = db.products.find_one({"_id": p_obj_id})
        if not product:
            return {"error": "Product not found", "code": "NOT_FOUND", "status": 404}
            
        stock = int(product.get("stock", 100))
        if stock < 1:
            return {"error": "Product is out of stock", "code": "OUT_OF_STOCK", "status": 400}
            
        cart = db.carts.find_one({"user_id": str(user_id)})
        
        if cart:
            items = cart.get("items", [])
            item_found = False
            for item in items:
                if str(item["product_id"]) == str(product_id):
                    new_qty = item["quantity"] + quantity
                    if new_qty > stock:
                        return {
                            "error": f"Cannot add more items. Only {stock} items available in stock.",
                            "code": "INSUFFICIENT_STOCK",
                            "status": 400
                        }
                    item["quantity"] = new_qty
                    item_found = True
                    break
            if not item_found:
                if quantity > stock:
                    return {
                        "error": f"Requested quantity ({quantity}) exceeds available stock ({stock})",
                        "code": "INSUFFICIENT_STOCK",
                        "status": 400
                    }
                items.append({
                    "product_id": str(product_id),
                    "title": product.get("name") or product.get("title"),
                    "price": float(product.get("price", 0)),
                    "quantity": quantity,
                    "image": product.get("image", "")
                })
            db.carts.update_one({"user_id": str(user_id)}, {"$set": {"items": items}})
        else:
            if quantity > stock:
                return {
                    "error": f"Requested quantity ({quantity}) exceeds available stock ({stock})",
                    "code": "INSUFFICIENT_STOCK",
                    "status": 400
                }
            db.carts.insert_one({
                "user_id": str(user_id),
                "items": [{
                    "product_id": str(product_id),
                    "title": product.get("name") or product.get("title"),
                    "price": float(product.get("price", 0)),
                    "quantity": quantity,
                    "image": product.get("image", "")
                }]
            })
            
        logger.info(f"User {user_id} added product {product_id} to cart (qty: {quantity})")
        return CartService.get_cart(user_id)

    @staticmethod
    def update_quantity(user_id, product_id, quantity):
        db = get_db()
        if quantity < 1:
            return CartService.remove_from_cart(user_id, product_id)
            
        try:
            p_obj_id = ObjectId(product_id)
        except Exception:
            return {"error": "Invalid product ID", "code": "INVALID_ID", "status": 400}
            
        product = db.products.find_one({"_id": p_obj_id})
        if not product:
            return {"error": "Product not found", "code": "NOT_FOUND", "status": 404}
            
        stock = int(product.get("stock", 100))
        if quantity > stock:
            return {
                "error": f"Requested quantity ({quantity}) exceeds available stock ({stock})",
                "code": "INSUFFICIENT_STOCK",
                "status": 400
            }
            
        cart = db.carts.find_one({"user_id": str(user_id)})
        if not cart:
            return {"error": "Cart not found", "code": "NOT_FOUND", "status": 404}
            
        items = cart.get("items", [])
        for item in items:
            if str(item["product_id"]) == str(product_id):
                item["quantity"] = quantity
                break
                
        db.carts.update_one({"user_id": str(user_id)}, {"$set": {"items": items}})
        return CartService.get_cart(user_id)

    @staticmethod
    def remove_from_cart(user_id, product_id):
        db = get_db()
        db.carts.update_one(
            {"user_id": str(user_id)},
            {"$pull": {"items": {"product_id": str(product_id)}}}
        )
        return CartService.get_cart(user_id)

    @staticmethod
    def clear_cart(user_id):
        db = get_db()
        db.carts.delete_one({"user_id": str(user_id)})
        return {"items": [], "subtotal": 0, "total_price": 0}
