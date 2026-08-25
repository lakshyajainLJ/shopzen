from datetime import datetime

def canonical_product(product_dict):
    if not product_dict:
        return None
    
    pid = str(product_dict.get("_id") or product_dict.get("id", ""))
    name = product_dict.get("name") or product_dict.get("title") or "Unnamed Product"
    price = float(product_dict.get("price", 0))
    description = product_dict.get("description", "")
    category = product_dict.get("category", "General")
    image = product_dict.get("image", "")
    stock = int(product_dict.get("stock", 100))
    
    created_at = product_dict.get("created_at")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    elif not created_at:
        created_at = datetime.utcnow().isoformat()

    updated_at = product_dict.get("updated_at")
    if isinstance(updated_at, datetime):
        updated_at = updated_at.isoformat()
    elif not updated_at:
        updated_at = datetime.utcnow().isoformat()

    return {
        "id": pid,
        "name": name,
        "description": description,
        "price": price,
        "category": category,
        "image": image,
        "stock": stock,
        "created_at": created_at,
        "updated_at": updated_at
    }
