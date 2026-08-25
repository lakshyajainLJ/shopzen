from datetime import datetime

def canonical_order(order_dict):
    if not order_dict:
        return None
    
    oid = str(order_dict.get("_id") or order_dict.get("id", ""))
    user_id = str(order_dict.get("user_id", ""))
    
    raw_items = order_dict.get("items", [])
    items = []
    for item in raw_items:
        items.append({
            "product_id": str(item.get("product_id", "")),
            "name_snapshot": item.get("name_snapshot") or item.get("title") or item.get("name") or "Product",
            "price_snapshot": float(item.get("price_snapshot") or item.get("price", 0)),
            "quantity": int(item.get("quantity", 1)),
            "image": item.get("image", "")
        })
    
    subtotal = float(order_dict.get("subtotal") or order_dict.get("total_amount") or order_dict.get("total_price") or 0)
    discount = float(order_dict.get("discount", 0))
    tax = float(order_dict.get("tax", 0))
    shipping = float(order_dict.get("shipping", 0))
    total = float(order_dict.get("total") or order_dict.get("total_amount") or (subtotal - discount + tax + shipping))

    created_at = order_dict.get("created_at")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    
    updated_at = order_dict.get("updated_at")
    if isinstance(updated_at, datetime):
        updated_at = updated_at.isoformat()

    return {
        "id": oid,
        "user_id": user_id,
        "user_name": order_dict.get("user_name"),
        "user_email": order_dict.get("user_email"),
        "items": items,
        "subtotal": subtotal,
        "discount": discount,
        "tax": tax,
        "shipping": shipping,
        "total": total,
        "total_amount": total, # for backwards compatibility with existing UI
        "total_price": total,  # for backwards compatibility with existing UI
        "shipping_address": order_dict.get("shipping_address") or order_dict.get("address", {}),
        "payment_method": order_dict.get("payment_method", "Cash on Delivery"),
        "payment_status": order_dict.get("payment_status", "PENDING"),
        "order_status": order_dict.get("order_status") or order_dict.get("status", "PLACED"),
        "status": order_dict.get("order_status") or order_dict.get("status", "PLACED"), # for backwards compatibility
        "created_at": created_at,
        "updated_at": updated_at
    }
