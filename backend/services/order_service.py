from datetime import datetime
from bson import ObjectId
from utils.db import get_db
from models.order_model import canonical_order
from utils.logger import logger

class OrderService:
    @staticmethod
    def place_order(user_id, checkout_data):
        db = get_db()
        cart = db.carts.find_one({"user_id": str(user_id)})
        
        if not cart or not cart.get("items"):
            return {"error": "Cart is empty", "code": "EMPTY_CART", "status": 400}
            
        cart_items = cart.get("items", [])
        order_items = []
        subtotal = 0.0
        
        # 1. Server-side validation of products and stock
        stock_updates = []
        for item in cart_items:
            product_id = item.get("product_id")
            quantity = int(item.get("quantity", 1))
            
            try:
                product = db.products.find_one({"_id": ObjectId(product_id)})
            except Exception:
                product = None
                
            if not product:
                return {
                    "error": f"Product with ID {product_id} no longer exists",
                    "code": "PRODUCT_NOT_FOUND",
                    "status": 400
                }
                
            stock = int(product.get("stock", 100))
            if quantity > stock:
                return {
                    "error": f"Insufficient stock for '{product.get('name') or product.get('title')}'. Requested: {quantity}, Available: {stock}",
                    "code": "INSUFFICIENT_STOCK",
                    "status": 400
                }
                
            live_price = float(product.get("price", 0))
            name_snapshot = product.get("name") or product.get("title") or "Product"
            image_snapshot = product.get("image", "")
            
            item_subtotal = live_price * quantity
            subtotal += item_subtotal
            
            order_items.append({
                "product_id": str(product_id),
                "name_snapshot": name_snapshot,
                "name": name_snapshot,
                "title": name_snapshot,
                "price_snapshot": live_price,
                "price": live_price,
                "quantity": quantity,
                "image": image_snapshot
            })
            
            stock_updates.append((ObjectId(product_id), quantity))
            
        # 2. Server-side authoritative calculation of discount, tax, shipping, total
        discount = round(subtotal * 0.20, 2) if subtotal > 500 else 0.0
        tax = round((subtotal - discount) * 0.05, 2)
        shipping = 0.0 if subtotal > 1000 else 50.0
        total = round(subtotal - discount + tax + shipping, 2)
        
        shipping_address = checkout_data.get("address") or checkout_data.get("shipping_address") or {}
        payment_method = checkout_data.get("payment_method", "Cash on Delivery")
        payment_status = "COMPLETED" if payment_method != "Cash on Delivery" else "PENDING"
        
        order_doc = {
            "user_id": str(user_id),
            "items": order_items,
            "subtotal": subtotal,
            "discount": discount,
            "tax": tax,
            "shipping": shipping,
            "total": total,
            "total_amount": total,
            "total_price": total,
            "shipping_address": shipping_address,
            "address": shipping_address,
            "payment_method": payment_method,
            "payment_status": payment_status,
            "order_status": "PLACED",
            "status": "PLACED",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        res = db.orders.insert_one(order_doc)
        order_id = str(res.inserted_id)
        order_doc["_id"] = res.inserted_id
        
        # 3. Deduct stock atomically
        for prod_id, qty in stock_updates:
            db.products.update_one(
                {"_id": prod_id},
                {"$inc": {"stock": -qty}}
            )
            
        # 4. Clear cart
        db.carts.delete_one({"user_id": str(user_id)})
        
        logger.info(f"Order placed successfully: ID {order_id} by User {user_id} for Total ₹{total}")
        return canonical_order(order_doc)

    @staticmethod
    def get_user_orders(user_id):
        db = get_db()
        cursor = db.orders.find({"user_id": str(user_id)}).sort("created_at", -1)
        return [canonical_order(o) for o in cursor]

    @staticmethod
    def get_all_orders():
        db = get_db()
        orders = list(db.orders.find().sort("created_at", -1))
        
        user_ids = list(set([o.get("user_id") for o in orders if o.get("user_id")]))
        user_obj_ids = []
        for uid in user_ids:
            try:
                user_obj_ids.append(ObjectId(uid))
            except Exception:
                pass
                
        users_cursor = db.users.find({"_id": {"$in": user_obj_ids}}, {"name": 1, "email": 1})
        user_map = {str(u["_id"]): u for u in users_cursor}
        
        result = []
        for o in orders:
            u_info = user_map.get(str(o.get("user_id")), {})
            o["user_name"] = u_info.get("name", "Customer")
            o["user_email"] = u_info.get("email", "")
            result.append(canonical_order(o))
            
        return result

    @staticmethod
    def update_order_status(order_id, status):
        db = get_db()
        try:
            res = db.orders.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": {"order_status": status, "status": status, "updated_at": datetime.utcnow()}}
            )
            if res.matched_count == 0:
                return {"error": "Order not found", "code": "NOT_FOUND", "status": 404}
            logger.info(f"Order {order_id} status updated to {status}")
            return {"message": "Status updated successfully", "status": status}
        except Exception:
            return {"error": "Invalid order ID", "code": "INVALID_ID", "status": 400}
