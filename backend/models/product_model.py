def product_schema(product):
    return {
        "id": str(product["_id"]),
        "title": product["title"],
        "price": product["price"],
        "image": product["image"],
        "category": product["category"]
    }
